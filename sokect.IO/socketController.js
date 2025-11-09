import { socketWrapper2 } from "../middleware/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { Room } from "../modules/roomSchema.js";
import { Message } from "../modules/messageSchema.js";
import { connectedUsers,userRooms,io } from "../main.js";
import { User } from "../modules/userSchema.js";

let joinRoom = (socket)=> socketWrapper2(socket,async(roomID,role)=>{

    console.log(`${socket.userName} tried to enter ${roomID}`);

    if(!roomID)
        throw new AppError("the room id is requied",400,"fail");

    let room = await Room.findById(roomID);

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

    // let voiceParticipants = room.participants.find(user=> user.hasVoiceAccess == true)

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
            }
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

    console.log(room);

    await room.removePerson(socket.userID);

    console.log("done");

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

    if(!room) throw new AppError("the user is not a room member",400,"fail");

    let user = room.participants.find(user=>String(user.userID) == String(socket.userID))

    if( user.role != "admin")
            await room.removePerson(socket.userID);

    const systemMessage = new Message({
        roomID:socket.currentRoom,
        userID:socket.userID,
        userName:'system',
        message: `${socket.userName} disconnected`,
        messageType: 'system'
    })
0
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
            isOnline:false,
            lastSeen:new Date(),
        });

        connectedUsers.delete(socket.id);
        userRooms.delete(socket.userID.toString());


})

let voiceRequest = (socket)=> socketWrapper2(socket,async(roomID)=>{

    if(!roomID)
    throw new AppError("not a valid roomID",400,"fail");

    // if (!socket.currentRoom || socket.currentRoom !== roomID)
    // throw new AppError("need to join room first",400,"fail");

    const room = await Room.findById(roomID);

    if(!room) throw new AppError("the room not found",400,"fail");

    let user = room.participants.find(user=> String(user.userID) == String(socket.userID));
    
    if(!user) throw new AppError("the user is not a room member",400,"fail");

    if(user.hasVoiceAccess) throw new AppError("you allready have a voice access",400,"fail");

    let voiceParticipants = room.participants.find(user=> user.hasVoiceAccess == true);

    if(!voiceParticipants) voiceParticipants = [];

    console.log("voiceParticipants",voiceParticipants);

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

    // 📢 إعلام جميع المستخدمين في الغرفة
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

    const room = await Room.findOne({ _id:roomID }).populate("participants.userID","userName");

    if(!room)throw new AppError("the room not found",400,"fail");

    let user = room.participants.find( user=> String(user.userID._id) == String(userID) );

    if(!user) throw new AppError("user id is not valid",400,"fail")

    if(!user.hasVoiceAccess)throw new AppError("you don't have a voice access",400,"fail");

    user.isMuted = isMuted
    await room.save();


    io.to(roomID).emit('user-microphone-toggled', {
        userId: userID,
        username: user.userID.userName,
        isMuted: isMuted,
    });
})

let speakingStatus = (socket)=> socketWrapper2(socket,async(data)=>{

    const { roomID, userID, isSpeaking } = data;

    const room = await Room.findOne({ _id:roomID }).populate("participants.userID","userName");

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

export {joinRoom,sendMessage,leaveRoom,disconnect,voiceRequest,toggleMicrophone,speakingStatus};