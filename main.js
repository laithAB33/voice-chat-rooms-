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
import { joinRoom , sendMessage , leaveRoom, disconnect,voiceRequest,toggleMicrophone,voiceData,priviteMessage,sendInvitation,acceptInvitation,acceptInvitationToMicrophone,inviteToMicrophone} from "./sokect.IO/socketController.js";
import { Router as OauthRouter } from "./Routes/OauthRouter.js";
import {Router as messageRouter} from "./Routes/messageRouter.js"
import passport from "passport";
import { User } from "./modules/userSchema.js";
import { createClient } from 'redis';

const redis = createClient({
    username: 'default',
    password: 'zHhCAgWMfoV0BrYr41m0dC6U1NuMZPLb',
    socket: {
        host: 'redis-12391.c13.us-east-1-3.ec2.cloud.redislabs.com',
        port: 12391
    }
});

redis.on('error', err => console.log('Redis Client Error', err));

await redis.connect();

redis.on('error', (err) => console.error('Redis Error:', err));
redis.on('connect', () => console.log('✅ Connected to Upstash Redis'))

let app = Express(),
    port = process.env.PORT;

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

export{redis};

app.use(Cors({credentials:true}));
app.use(Express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//end point
app.use('/api/auth',OauthRouter);
app.use('/api/user',userRouter);
app.use('/api/room',roomRouter);
app.use('/api/message',messageRouter);
io.use(socketAuth);



export{io};

io.on('connection',socketWrapper(async(socket)=>{

    let user = await User.findByIdAndUpdate(socket.userID,{isOnline:true});

    await redis.set(`userID:socketID${socket.userID}`,socket.id);

    socket.on('join-room',joinRoom(socket));
    
    socket.on('send-message',sendMessage(socket,user));

    socket.on('leave-Room',leaveRoom(socket));

    socket.on('disconnect',disconnect(socket,user));

    socket.on('request-voice-access',voiceRequest(socket));

    socket.on('toggle-microphone',toggleMicrophone(socket));

    // socket.on('speaking-Status',speakingStatus(socket));

    socket.on('voice-data',voiceData(socket));

    socket.on('privite-message',priviteMessage(socket));

    socket.on('send-invitation',sendInvitation(socket));

    socket.on('accept-invitation',acceptInvitation(socket));

    socket.on('invite-to-microphone',inviteToMicrophone(socket));

    socket.on('accept-invitation-to-microphone',acceptInvitationToMicrophone(socket));
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

