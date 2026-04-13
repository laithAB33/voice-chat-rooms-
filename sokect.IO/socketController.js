import { socketWrapper2 } from "../middleware/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { Room } from "../modules/roomSchema.js";
import { Message } from "../modules/messageSchema.js";
import {io} from "../main.js";
import { User } from "../modules/userSchema.js";
import { PriviteMessage } from "../modules/priviteMessageSchema.js";
import { Invitation } from "../modules/invitationSchema.js";
import { redis } from "../main.js";
import { authentication } from "../utils/authentication.js";

let joinRoom = (socket)=> socketWrapper2(socket,async(data)=>{

    let {roomID,password = ""} = data;

    if(!roomID)
        throw new AppError("the room id is requied",400,"fail");

    let room = await Room.findOne({_id:roomID,isActive:"active"}),role = "member";

    if(!room)
        throw new AppError("the room not found",400,"fail");

    if(String(room.createdBy) == String(socket.userID))role = "owner";

    if(room.isFull() && role != "owner")
        throw new AppError("the room is full",400,"fail");

    let bannedUser = undefined,index = -1;

    for(let i = 0 ; i < room.banList.length;i++)
    {
        if(String(room.banList[i].userID) == String(socket.userID))
        {
            index = i;
            bannedUser = room.banList[i];

            if(bannedUser.end < Date.now()) room.banList.splice(index,1);

            else throw new AppError("you can not enter the room",403,"fail");
        }
    }

    if(room.password != "0000")
    await authentication(password,room.password);

    await room.addPerson(socket.userID,role);

    socket.join(roomID);

    redis.set(`userID:roomID${socket.userID}`,roomID);

    const messages = await Message.find({roomID})
        .populate("userID","userName profileImage")
        .sort({createdAt: -1})
        .limit(50)
        .lean();  // only read less time

    const systemMessage = new Message({
        roomID,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} joined the group`,
        messageType: 'system'
    })

    await systemMessage.save();

    socket.emit('room-joined',{
        success:true,
        room:{
            id:roomID,
            name:room.name,
            description:room.description,
            participants:room.participants,
            participantCount:room.participants.length,
        },
        messages,
        systemMessage:{
            id:systemMessage._id,
            message:systemMessage.message,
        }

    })

    socket.to(roomID).emit('user-joined',{
        userName:socket.userName,
        messages:`${socket.userName} joined the group`,
        timestamps:new Date(),
        participants:room.participants,
        isSpeaking: false,
        hasVoiceAccess: false,
    })

});

let sendMessage = (socket,user)=> socketWrapper2(socket,async(data)=>{

    let {message, messageType = 'text',fileUrl = null} = data;

    let roomID = await redis.get(`userID:roomID${socket.userID}`);

    if(!roomID) throw new AppError("the user is not in room",404,"fail");

    let checkRoom = await Room.findOne(
        {
            _id:roomID,
            participants:
            {
                $elemMatch:
                {
                    userID:socket.userID,
                }
            },
            isActive:"active"
        });

    if(!checkRoom) throw new AppError("your are not in a room",404,"fail");

    if(checkRoom.chatActive == "notactive")throw new AppError("chat is closed",403,"fail");

    if(!message || message.trim() === '') throw new AppError("the message can't be empty");

    let newMessage = new Message({
        roomID,
        userID:socket.userID,
        userName:socket.userName,
        message:message.trim(),
        messageType:messageType,
        fileUrl:fileUrl
    })

    await newMessage.save();


        
        io.to(roomID).emit('new-message',{
            MassageID:newMessage._id,
            userID:user._id,
            userName:user.userName,
            profileImage:user.profileImage,
            message:newMessage.message,
            messageType:messageType,
            file:newMessage.fileUrl,
            timestamp:newMessage.createdAt,
        })

});

let leaveRoom = (socket)=> socketWrapper2(socket,async()=>{

    let roomID = await redis.get(`userID:roomID${socket.userID}`);

    if(!roomID) throw new AppError("the user is not a room member",404,"fail");

    let room = await Room.findById(roomID);

    if(!room) throw new AppError("the room id is not valid",400,"fail");

    await room.removePerson(socket.userID);

    await redis.del(`userID:roomID${socket.userID}`);

    const systemMessage = new Message({
        roomID,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} left the group`,
        messageType: 'system'
    })

    await systemMessage.save();

    io.to(roomID).emit('user-left',{
        userName:socket.userName,
        message: `${socket.userName} left the group`,
        timestamps:new Date(),
        participants:room.participants,
        systemMessage:{
            id:systemMessage._id,
            message:systemMessage.message,
            timestamp:systemMessage.createdAt
        }
    })

    socket.leave(roomID);

    socket.emit('room-left',{
        success:true,
        message:"left the room successfully"
    })


})

let disconnect = (socket,user)=> socketWrapper2(socket,async()=>{

    let roomID = await redis.get(`userID:roomID${socket.userID}`);

    await redis.del(`userID:roomID${socket.userID}`);
    await redis.del(`userID:socketID${socket.userID}`);

    let room = await Room.findById(roomID);

    user.online = false;
    user.lastSeen = new Date();

    await user.save();

    if(!room) return;

    let isMember = room.participants.find(user=>String(user.userID) == String(socket.userID));

    if(!isMember) throw new AppError("the user is not a room member",400,"fail");

    await room.removePerson(socket.userID);

    const systemMessage = new Message({
        roomID,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} disconnected`,
        messageType: 'system'
    })

    await systemMessage.save();

    io.to(roomID).emit('user-disconnected',{
        userName:socket.userName,
        message:`${socket.userName} disconnected`,
        timestamp: new Date,
        systemMessage:{
            id:systemMessage._id,
            message:systemMessage.message,
            timestamp: systemMessage.createdAt,
        }
    })

})


let voiceRequest = (socket)=> socketWrapper2(socket,async()=>{

    let roomID = await redis.get(`userID:roomID${socket.userID}`);

    if(!roomID)
    throw new AppError("user is not a room member",400,"fail");

    let room = await Room.findOne({_id:roomID,isActive:"active"});

    if(!room) throw new AppError("the room not found",404,"fail");

    let user = room.participants.find(user=> String(user.userID) == String(socket.userID));
    
    if(!user) throw new AppError("the user is not a room member",400,"fail");

    if(user.hasVoiceAccess) throw new AppError("you allready have a voice access",400,"fail");

    let voiceParticipants = room.participants.filter(user=> user.hasVoiceAccess == true);

    if(!voiceParticipants) voiceParticipants = [];

    if(voiceParticipants.length >= room.maxVoiceParticipants)
        throw new AppError("there is no available audio seats",400,"fail");

    user.isMuted = false;
    user.hasVoiceAccess = true;

    await room.save();

    socket.hasVoiceAccess = true;

    socket.join(`voice-${roomID}`);

    socket.emit('voice-access-granted', {
        success: true,
        message: 'voice access granted',
        currentVoiceParticipants: voiceParticipants
    });

    io.to(roomID).emit('user-joined-voice', {
        userId: socket.userID,
        username: user.userName,
        isMuted: false,
        isSpeaking: false,
        currentVoiceParticipants: voiceParticipants
    })

})

let toggleMicrophone = (socket)=> socketWrapper2(socket,async(data)=>{

    const {userID, isMuted } = data;

    let roomID = await redis.get(`userID:roomID${socket.userID}`);

    let room = await Room.findOne({_id:roomID,isActive:"active"}).populate("participants.userID","userName");

    if(!room)throw new AppError("the room not found",400,"fail");

    let userToMute = room.participants.find( user=> String(user.userID._id) == String(userID) );

    let responsible = room.participants.find( user=> String(user.userID._id) == String(socket.userID) );

    if(!userToMute) throw new AppError("user id is not valid",400,"fail");

    if(!userToMute.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

    if((responsible == userToMute) || (responsible.role == "owner") || (responsible.role == "admin" && userToMute.role == "member"))
    userToMute.isMuted = isMuted;
    else throw new AppError("require authorization",403,"fail");

    await room.save();

    io.to(roomID).emit('user-microphone-toggled', {
        userId: userID,
         username: userToMute.userID.userName,
        isMuted: isMuted,
    });
})

// let speakingStatus = (socket)=> socketWrapper2(socket,async(data)=>{

//     const { roomID, userID, isSpeaking } = data;

//     const room = await Room.findOne({ _id:roomID,isActive:"active" }).populate("participants.userID","userName");

//     if(!room)throw new AppError("the room not found",400,"fail");

//     let user = room.participants.find( user=> String(user.userID._id) == String(userID) );

//     if(!user) throw new AppError("user id is not valid",400,"fail")

//     if(!user.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

//     user.isSpeaking = isSpeaking
//     await room.save();


//     io.to(roomID).emit('user-speaking-status', {
//         userId: userID,
//         username: user.userID.userName,
//         isSpeaking: isSpeaking,
//     });
// })

let voiceData = (socket)=> socketWrapper2(socket,async(data)=>{

    let roomID = await redis.get(`userID:roomID${socket.userID}`);
    
    const room = await Room.findOne({ _id:roomID,isActive:"active"})

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find( user=> String(user.userID._id) == String(socket.userID) );

    if(!user) throw new AppError("user id is not valid",400,"fail")

    if(!user.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

    if(user.isMuted)throw new AppError("user is muted",400,"fail");
 
        io.to(`voice-${roomID}`).emit('voice-data', {
            userID: socket.userID,
            audioData: data
        })

})


let priviteMessage = (socket)=>socketWrapper2(socket,async(data)=>{

    let {message, messageType = 'text',fileUrl = null,userID} = data;

    let user = await User.findById(userID);

    if(!user) throw new AppError("the user id is not valid",400,"fail");

    let socketID = await redis.get(`userID:socketID${userID}`),
        delivered = false;
    
    if(socketID)delivered = true;

    let newMessage = new PriviteMessage({senderID:socket.userID,receiverID:userID,message,messageType,delivered})

    await newMessage.save();

    socket.emit('message-sent',{
        senderID:socket.userID,
        receiverID:userID,
        message,
        messageType,
        delivered:false
    })

    if(!socketID)return;

    io.to(socketID).emit('message-received',{
        senderID:socket.userID,
        receiverID:userID,
        message,
        messageType,
        delivered
    })

})

let sendInvitation = (socket)=>socketWrapper2(socket,async(data)=>{

    let {userID,roomID} = data, delivered = false;

    let room = await Room.findOne({_id:roomID,isActive:"active"})

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find(user=> String(user.userID) ==  String(userID));

    if(user)throw new AppError("the user is a room member",400,"fail");

    let admin = room.participants.find(user=> String(user.userID) == String(socket.userID));

    if( !admin || admin.role == "member") throw new AppError("only an admin can send a invitation",403,"fail");

////////////////
    let bannedUser = null,index = -1;

    for(let i = 0 ; i < room.banList.length;i++)
    {
        if(String(room.banList[i].userID) == String(userID))
        {
            index = -1;
            bannedUser = userID;
        }
    }
    
    if(bannedUser)
    {
        room.banList.splice(index,1);
    }
//////////////////
    

    let socketID = await redis.get(`userID:socketID${userID}`);

    if(socketID)delivered = true;

    let invitation = new Invitation({senderID:socket.userID,receiverID:userID,roomID,delivered,type:"toRoom"})

    await invitation.save();

    socket.emit('invitation-sent',{
        senderID:socket.userID,
        receiverID:userID,
        roomID,
        delivered:false
    })

    if(!socketID)return;


    io.to(socketID).emit('invitation-received',{
        senderID:socket.userID,
        receiverID:userID,
        roomID,
        delivered
    })

})

let acceptInvitation = (socket)=>socketWrapper2(socket,async(data)=>{
    
    let {userID,roomID,accept} = data;

    let invitation = await Invitation.findOne({senderID:userID,receiverID:socket.userID,roomID,type:"toRoom"});

    if(!invitation)throw new AppError("does not match any invitation info",400,"fail");

    if(!accept)
    {
        await invitation.deleteOne();
        return;
    } 

    if(!roomID)
    throw new AppError("the room id is requied",400,"fail");

    let room = await Room.findOne({_id:roomID,isActive:"active"});

    if(!room)
        throw new AppError("the room not found",400,"fail");

    if(room.isFull())
     throw new AppError("the room is full",400,"fail");

    await room.addPerson(socket.userID);

    socket.join(roomID);

    await redis.set(`userID:roomID${socket.userID}`,roomID);

    const messages = await Message.find({roomID})
        .populate("userID","userName profileImage")
        .sort({createdAt: -1})
        .limit(50)
        .lean();  // only read less time

    const systemMessage = new Message({
        roomID,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} joined the group`,
        messageType: 'system'
    })

    await systemMessage.save();

    socket.emit('room-joined',{
        success:true,
        room:{
            id:roomID,
            name:room.name,
            description:room.description,
            participants:room.participants,
            participantCount:room.participants.length,
        },
        messages,
        systemMessage:{
            id:systemMessage._id,
            message:systemMessage.message,
        }

    })

    socket.to(roomID).emit('user-joined',{
        userName:socket.userName,
        messages:`${socket.userName} joined the group`,
        timestamps:new Date(),
        participants:room.participants,
        isSpeaking: false,
        hasVoiceAccess: false,
    })


})
///////////////////////////////////////////////////////////////////////////////
let inviteToMicrophone = (socket)=>socketWrapper2(socket,async(data)=>{

    let {userID,roomID} = data;
    
    let room = await Room.findOne({_id:roomID,isActive:"active"})

    if(!room)throw new AppError("the room not found",400,"fail");

    let receiver = room.participants.find(user=>String(user.userID) == String(userID));

    let sender = room.participants.find(user=>String(user.userID) == String(socket.userID));

    if(!sender || sender?.role == "member") throw new AppError("only an admin can send a invitation",403,"fail");

    if(!receiver)throw new AppError("the user is not a group member",400,"fail");
    
    if(receiver.hasVoiceAccess)throw new AppError("the user already has voice access",400,"fail");

    let socketID = await redis.get(`userID:socketID${userID}`);

    if(!socketID)throw new AppError("user is not connected",408,"fail");


    await redis.set(`receiver:sender${userID}`,`{"userID":"${socket.userID}","roomID":"${roomID}"}`);

    console.log(socketID);
    socket.emit('invite-toMic-send',{
        senderID:socket.userID,
        receiverID:userID,
        roomID,
    })

    io.to(socketID).emit('invite-toMic-received',{
        senderID:socket.userID,
        receiverID:userID,
        roomID,
    })
})

let acceptInvitationToMicrophone = (socket)=>socketWrapper2(socket,async(data)=>{

    let {userID,roomID} = data;

    let room = await Room.findOne({_id:roomID,isActive:"active"})

    if(!room)throw new AppError("the room not found",404,"fail");

    let receiver = room.participants.find(user=>String(user.userID) == String(socket.userID));

    if(!receiver)throw new AppError("the user is not a group member",400,"fail");

    let invitation = await redis.get(`receiver:sender${socket.userID}`);
    
    let socketID = await redis.get(`userID:socketID${userID}`);

    invitation = JSON.parse(invitation);

    console.log(invitation);

    if(!invitation || (String(invitation.userID) != String(userID) ||  String(invitation.roomID) != String(roomID)) )throw new AppError("the invitation dose not exists",400,"fail");
    
    socket.join(`voice-${roomID}`);

    receiver.hasVoiceAccess = true;

    await room.save();


    await redis.del(`receiver:sender${socket.userID}`)

    socket.emit('joined-mic',{
        senderID:userID,
        receiverID:socket.userID,
        roomID,
    })

    io.to(socketID).emit('user-joined-mic',{
        senderID:userID,
        receiverID:socket.userID,
        roomID,
        messages:`${socket.userName} joined-mic`,
    })
})

export {joinRoom,sendMessage,leaveRoom,disconnect,voiceRequest,toggleMicrophone,voiceData,priviteMessage,sendInvitation,acceptInvitation,acceptInvitationToMicrophone,inviteToMicrophone};