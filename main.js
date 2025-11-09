import "dotenv/config";
import Express from "express";
import mongoose from "mongoose"; 
import { createServer } from 'http';
import { Server } from 'socket.io';
import  Cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { globalErrorHandler } from "./controller/globalErrorHandler.js";
import {Router as userRouter} from './Routes/userRouter.js';
import { Router as roomRouter } from "./Routes/roomRouter.js";
import { socketAuth } from "./sokect.IO/socketAuth.js";
import { socketWrapper} from "./middleware/asyncWrapper.js";
import { joinRoom , sendMessage , leaveRoom, disconnect,voiceRequest,toggleMicrophone,speakingStatus} from "./sokect.IO/socketController.js";
import { User } from "./modules/userSchema.js";
import { Router as OauthRouter } from "./Routes/OauthRouter.js";
import passport from "passport";

let app = Express(),
    port = process.env.PORT || 3000;

let http = createServer(app),
    io = new Server(http, {
        cors: {
            origin: "*",
            credentials: true,
            allowedHeaders:["content-Type"],

          },
          transports: ['websocket', 'polling']
    });

app.use(passport.initialize());
import './strategy/googleStrategy.js';

mongoose.connect(process.env.MONGODB_CONNECT_STR)
.then(()=>{
    console.log("mongodb connected successfly");
}).catch((err)=>{
    console.log("mongodb connection error",err);
})

app.use(Cors({credentials:true}));
app.use(Express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//end point
app.use('/auth',OauthRouter);
app.use('/api/user',userRouter);
app.use('/api/room',roomRouter);

io.use(socketAuth);

let connectedUsers = new Map(); //socketID : userData
let userRooms = new Map(); // userID : roomID

export{connectedUsers,userRooms,io};

io.on('connection',socketWrapper(async(socket)=>{

    console.log(`client is connected userName ${socket.userName}\n conection: ${socket.id}\n`);

    let user = await User.findByIdAndUpdate(socket.userID,{isOnline:true});

    connectedUsers.set(socket.id,{
        userName:socket.userName,
        userID : socket.userID,
        profileImage:socket.profileImage,
        connectAt:new Date(),
    })

    socket.on('join-room',joinRoom(socket));
    
    socket.on('send-message',sendMessage(socket));

    socket.on('leave-Room',leaveRoom(socket));

    socket.on('disconnect',disconnect(socket));

    socket.on('request-voice-access',voiceRequest(socket));

    socket.on('toggle-microphone',toggleMicrophone(socket));

    socket.on('speaking-Status',speakingStatus(socket));

}))

app.use(globalErrorHandler);

app.use((req,res)=> {
    res.status(404).json({
        success:false, 
        status:"fail", 
        message: "this resourse is not available", 
        data:null,
    });
})

http.listen(port,()=>{
    console.log(`listening on port ${port}`);
})

// typing message when user is typing
