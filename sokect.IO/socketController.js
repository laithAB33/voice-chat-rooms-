import { socketWrapper2 } from "../middleware/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { Room } from "../modules/roomSchema.js";
import { Message } from "../modules/messageSchema.js";
import { connectedUsers,userRooms,io,invitationToMic } from "../main.js";
import { User } from "../modules/userSchema.js";
import { PriviteMessage } from "../modules/priviteMessageSchema.js";
import { Invitation } from "../modules/invitationSchema.js";

let joinRoom = (socket)=> socketWrapper2(socket,async(roomID)=>{

    if(!roomID)
        throw new AppError("the room id is requied",400,"fail");

        let room = await Room.findOne({_id:roomID,isActive:true}),role = "member";

    if(!room)
        throw new AppError("the room not found",400,"fail");

    if(String(room.createdBy) == String(socket.userID))role = "owner";

    if(room.isFull() && role != "owner")
        throw new AppError("the room is full",400,"fail");

    await room.addPerson(socket.userID,role);

    socket.join(roomID);

    socket.currentRoom = roomID;

    userRooms.set(socket.userID.toString(),roomID);

    connectedUsers.get(socket.id).currentRoom = roomID;

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

let sendMessage = (socket)=> socketWrapper2(socket,async(data)=>{

    let {message, messageType = 'text',fileUrl = null,roomID} = data;

    if(roomID) socket.currentRoom = roomID;

    let checkRoom = await Room.findOne(
        {
            _id:socket.currentRoom,
            participants:
            {
                $elemMatch:
                {
                    userID:socket.userID,
                }
            },
            isActive:true
        });

    if(!checkRoom) throw new AppError("your are not in the group",400,"fail");

    if(!message || message.trim() === '') throw new AppError("the message can't be empty");

    let newMessage = new Message({
        roomID:socket.currentRoom,
        userID:socket.userID,
        userName:socket.userName,
        message:message.trim(),
        messageType:messageType,
        fileUrl:fileUrl
    })

    await newMessage.save();

    let userAndMessage = await Message.findById(newMessage._id)
        .populate('userID','userName profileImage');
        
        io.to(socket.currentRoom).emit('new-message',{
            MassageID:userAndMessage._id,
            userID:userAndMessage.userID._id,
            userName:userAndMessage.userID.userName,
            profileImage:userAndMessage.userID.profileImage,
            message:userAndMessage.message,
            messageType:userAndMessage.messageType,
            file:userAndMessage.fileUrl,
            timestamp:userAndMessage.createdAt,
        })

});

let leaveRoom = (socket)=> socketWrapper2(socket,async(roomID)=>{

    if(roomID) socket.currentRoom = roomID;

    if(!socket.currentRoom) throw new AppError("the room id is required",400,"fail");

    let room = await Room.findById(socket.currentRoom);

    if(!room) throw new AppError("the room id is not valid",400,"fail");

    await room.removePerson(socket.userID);

    const systemMessage = new Message({
        roomID:socket.currentRoom,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} left the group`,
        messageType: 'system'
    })

    await systemMessage.save();

    socket.to(socket.currentRoom).emit('user-left',{
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

    socket.leave(socket.currentRoom);

    userRooms.delete(socket.userID.toString());

    socket.currentRoom = null;

    socket.emit('room-left',{
        success:true,
        message:"left the room successfully"
    })


})

let disconnect = (socket)=> socketWrapper2(socket,async()=>{

    let room = await Room.findById(socket.currentRoom);


    if(!room)
    {
        connectedUsers.delete(socket.id);
        userRooms.delete(socket.userID.toString());

        return
    }

    let user = room.participants.find(user=>String(user.userID) == String(socket.userID))

    await room.removePerson(socket.userID);

    connectedUsers.delete(socket.id);

    userRooms.delete(socket.userID.toString());


    const systemMessage = new Message({
        roomID:socket.currentRoom,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} disconnected`,
        messageType: 'system'
    })

    await systemMessage.save();

    socket.to(socket.currentRoom).emit('user-disconnected',{
        userName:socket.userName,
        message:`${socket.userName} disconnected`,
        timestamp: new Date,
        systemMessage:{
            id:systemMessage._id,
            message:systemMessage.message,
            timestamp: systemMessage.createdAt,
        }
    })

    await User.findByIdAndUpdate(socket.userID,
        {
            lastSeen:new Date(),
        });




})

let voiceRequest = (socket)=> socketWrapper2(socket,async(roomID)=>{

    if(!roomID)
    throw new AppError("not a valid roomID",400,"fail");

    let room = await Room.findOne({_id:roomID,isActive:true});

    if(!room) throw new AppError("the room not found",400,"fail");

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

    const { roomID, userID, isMuted } = data;

    let room = await Room.findOne({_id:roomID,isActive:true}).populate("participants.userID","userName");

    if(!room)throw new AppError("the room not found",400,"fail");

    let userToMute = room.participants.find( user=> String(user.userID._id) == String(userID) );

    let responsible = room.participants.find( user=> String(user.userID._id) == String(userID) );

    if(!userToMute) throw new AppError("user id is not valid",400,"fail");

    if(!userToMute.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

    if((responsible == userToMute) || (responsible.role == "owner") || (responsible.role == "admin" && userToMute.role != "user"))
    userToMute.isMuted = isMuted;
    else throw new AppError("require authorization",403,"fail");

    await room.save();

    io.to(roomID).emit('user-microphone-toggled', {
        userId: userID,
        username: user.userID.userName,
        isMuted: isMuted,
    });
})

let speakingStatus = (socket)=> socketWrapper2(socket,async(data)=>{

    const { roomID, userID, isSpeaking } = data;

    const room = await Room.findOne({ _id:roomID,isActive:true }).populate("participants.userID","userName");

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find( user=> String(user.userID._id) == String(userID) );

    if(!user) throw new AppError("user id is not valid",400,"fail")

    if(!user.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

    user.isSpeaking = isSpeaking
    await room.save();


    io.to(roomID).emit('user-speaking-status', {
        userId: userID,
        username: user.userID.userName,
        isSpeaking: isSpeaking,
    });
})

let voiceData = (socket)=> socketWrapper2(socket,async(data)=>{

    const { roomID, userID, audioData } = data;

    const room = await Room.findOne({ _id:roomID,isActive:true})

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find( user=> String(user.userID._id) == String(userID) );

    if(!user) throw new AppError("user id is not valid",400,"fail")

    if(!user.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");
 
        socket.to(data.roomID).emit('voice-data', {
            userId: data.userID,
            audioData: data.audioData
        })

})

let priviteMessage = (socket)=>socketWrapper2(socket,async(data)=>{

    let {message, messageType = 'text',fileUrl = null,userID} = data;

    let socketID,delivered = false;


    let user = await User.findById(userID);

    if(!user) throw new AppError("the user id is not valid",400,"fail");

    for(let [key,value] of connectedUsers)
    {
        if(value.userID == userID)
        {
            socketID = key; break;
        }
    }

    if(socketID)delivered = true;

    let newMessage = new PriviteMessage({senderID:socket.userID,receiverID:userID,message,messageType,delivered})

    await newMessage.save();

    io.to(socket.id).emit('message-sent',{
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

    let {userID,roomID} = data, delivered = false,socketID;

    let room = await Room.findOne({_id:roomID,isActive:true})

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find(user=>user.userID == userID);

    if(user)throw new AppError("the user is a room member",400,"fail");

    let admin = room.participants.find(user=> String(user.userID) == String(socket.userID));

    if( !admin || admin.role == "member") throw new AppError("only an admin can send a invitation",403,"fail");

    for(let [key,value] of connectedUsers)
    {
        if(value.userID == userID)
        {
            socketID = key; break;
        }
    }

    if(socketID)delivered = true;

    let invitation = new Invitation({senderID:socket.userID,receiverID:userID,roomID,delivered,type:"toRoom"})

    await invitation.save();

    io.to(socket.id).emit('invitation-sent',{
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

    let room = await Room.findOne({_id:roomID,isActive:true});

    if(!room)
        throw new AppError("the room not found",400,"fail");

    if(room.isFull())
     throw new AppError("the room is full",400,"fail");

    await room.addPerson(socket.userID);

    socket.join(roomID);

    socket.currentRoom = roomID;

    userRooms.set(socket.userID.toString(),roomID);

    connectedUsers.get(socket.id).currentRoom = roomID;

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

let inviteToMicrophone = (socket)=>socketWrapper2(socket,async(data)=>{

    let {userID,roomID} = data,socketID;
    
    let room = await Room.findOne({_id:roomID,isActive:true})

    if(!room)throw new AppError("the room not found",400,"fail");

    let receiver = room.participants.find(user=>user.userID == userID);

    let sender = room.participants.find(user=>String(user.userID) == String(socket.userID));

    if(!sender || sender?.role == "member") throw new AppError("only an admin can send a invitation",403,"fail");

    if(!receiver)throw new AppError("the user is not a group member",400,"fail");
    
    if(receiver.hasVoiceAccess)throw new AppError("the user already has voice access",400,"fail");

    for(let [key,value] of connectedUsers)
    {
        if(value.userID == userID)
        {
            socketID = key; break;
        }
    }
    if(!socketID)throw new AppError("user is not connected",408,"fail");

    invitationToMic.set(String(socket.userID),{userID,roomID}); // sender receiver

    io.to(socket.id).emit('invite-toMic-send',{
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

    let {userID,roomID} = data,socketID;

    let room = await Room.findOne({_id:roomID,isActive:true})

    if(!room)throw new AppError("the room not found",400,"fail");

    let receiver = room.participants.find(user=>String(user.userID) == String(socket.userID));

    if(!receiver)throw new AppError("the user is not a group member",400,"fail");

    let invitation = invitationToMic.get(String(userID));

    if(!invitation || (invitation.userID != String(socket.userID) ||  invitation.roomID != String(roomID)) )throw new AppError("the invitation dose not exists",400,"fail");

    receiver.hasVoiceAccess = true;

    await room.save();

    io.to(socket.id).emit('joined-mic',{
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

export {joinRoom,sendMessage,leaveRoom,disconnect,voiceRequest,toggleMicrophone,speakingStatus,voiceData,priviteMessage,sendInvitation,acceptInvitation,acceptInvitationToMicrophone,inviteToMicrophone};