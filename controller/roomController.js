import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Room } from "../modules/roomSchema.js";
import {Message} from "../modules/messageSchema.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { cloudinary } from "../utils/cloudinary.js";

let create = asyncWrapper(async(req,res,next)=>{

    let {name,description} = req.body,photo;

    let oldRoom = await Room.findOne({createdBy:req.userID});

    if(oldRoom) return next(new AppError("the user have a room ",400,"fail"));

    let room = new Room({
        name,
        description,
        createdBy:req.userID,

    });

    if(req.file){

        try{ photo = await uploadToCloudinary(req) }
        catch(err){
            return next(new AppError("error uploading image",500,"error"));
        }
    }

    room.image.url = photo?.url;
    room.image.public_id = photo?.public_id;


    await room.save();

    // await room.addPerson(req.userID,"owner");


    res.status(201).json({success: true ,status:"success",message: "room created successflly" ,
    data:{
        roomID: room._id,
        participants:room.participants,
    }});

})

let getAll = asyncWrapper(async(req,res,next)=>{

    let rooms = await Room.find({isActive:true})
        .populate('createdBy','userName')
        .populate('participants.userID','userName')
        .sort({createdAt:-1});

        res.status(200).json({success: true ,status: "success" ,message: "all the rooms" ,data:{rooms} })
})

let roomMessage = asyncWrapper(async(req,res,next)=>{

    let {roomID} = req.params;
    let {page = 1, limit = 50} = req.query;

    let room = await Room.findOne({_id:roomID});

    if(!room) return next(new AppError("room with his id dose not exist",404,"fail"));

    let user = room.participants.find(user => String(user.userID) == String(req.userID))

    if(!user) return next(new AppError("user is not a room member",403,"fail"));

    let messages = await Message.find({roomID})
        .populate("userID","userName")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1)*limit);

        res.status(200).json({success: true ,status: "success" ,message: "all the messages in the room" ,data:{messages} })

})

let getRoom = asyncWrapper(async(req,res,next)=>{

    let {roomID} = req.params;

    let room = await Room.findById(roomID);

    res.status(200).json({success: true ,status: "success" ,message: "room info" ,data:{room}})
})

let getMyrooms = asyncWrapper(async(req,res,next)=>{

    let rooms = await Room.find({
        participants:
        {
            $elemMatch:
            {
                userID:req.userID,
            }
        }
    })

    res.status(200).json({success: true ,status: "success" ,message: "all the rooms the user is in" ,data:{rooms} })
})

let updateRoom = asyncWrapper(async(req,res,next)=>{

    let {roomID} = req.params;
    let {name,description,maxVoiceParticipants,chatActive,isActive} = req.body;

    let room = await Room.findOne({_id:roomID,}),photo;

    if(!room) return next(new AppError("room with his id dose not exist",404,"fail"));

    if(String(room.createdBy) != String(req.userID)) return next(new AppError("you are not the room creator",403,"fail"));

    if(req.file)
    {
        photo = await uploadToCloudinary(req)
        let image = room.image
        if(image?.public_id)await cloudinary.uploader.destroy(image.public_id);

    }

    let updatedRoom = await Room.findByIdAndUpdate(
    {_id:roomID},
    {
        name,description,maxVoiceParticipants,chatActive,isActive,
        image:{
        url:photo?.url,
        public_id:photo?.public_id,  
        }
    },
    {new:true}
);

    res.status(200).json({success: true ,status: "success" ,message: "room updated" ,data:{updatedRoom}})
})

let banUser = asyncWrapper(async(req,res,next)=>{

    let {userID,roomID,time} = req.body

    let room = await Room.findById(roomID);

    if(!room) return next(new AppError("room with this id dose not exist",404,"fail"));
 
    let index = -1,user,admin;

    for(let i =0 ;i<room.participants.length;i++)
    {
        if(String(room.participants[i].userID) == String(userID))
        {
            index = i;
            user = room.participants[i];
        }
        if(String(room.participants[i].userID) == String(req.userID))
        {
            admin = room.participants[i].userID;
        }
    }
    ;
    if(!admin || admin.role == "member")
    if(index == -1) return next(new AppError("user with this id is not in the room",404,"fail"))
 
    room.participants.splice(index,1);
 
    room.banList.push({
        userID:userID,
        start:Date.now(),
        end:Date.now() + (time *1000),
    })
   
    await room.save();

    console.log(room)

    res.status(200).json({success: true ,status: "success" ,message: "the user is banned " ,data:{banList:room.banList}})
    
})

let deleteRoom =  asyncWrapper(async(req,res,next)=>{
    
    let {roomID} = req.params;

    let room = await Room.findById(roomID);

    if(!room) return next(AppError("room not found",404,"fail"));

    if(String(room.createdBy) != String(req.userID)) return next(AppError("user is not the owner",403,"fail"));

    let image = room.image;

    if(image?.public_id)await cloudinary.uploader.destroy(image.public_id);        
    console.log(image);
    await room.deleteOne();

    res.status(200).json({success:true, status:"success", message:"room deleted", data:{roomID}})

})
export{create,getAll,roomMessage,getRoom,getMyrooms,updateRoom,banUser,deleteRoom};
