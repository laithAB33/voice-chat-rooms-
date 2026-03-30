import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Room } from "../modules/roomSchema.js";
import {Message} from "../modules/messageSchema.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

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

    await room.addPerson(req.userID,"admin");


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

let changeStatus = asyncWrapper(async(req,res,next)=>{
    
    let {roomID} = req.params;

    let room = await Room.findOne({_id:roomID});

    if(!room) throw new AppError("the room not found",400,"fail");

    room.isActive = !room.isActive;

    await  room.save();

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
    let {name,description,maxVoiceParticipants} = req.body;

    let room = await Room.findOne({_id:roomID}),photo;

    if(req.file)
    {
        photo = await uploadToCloudinary(req)
        let image = room.image
        if(image?.public_id)await cloudinary.uploader.destroy(image.public_id);

    }

    let updatedRoom = await Room.findByIdAndUpdate(
    {_id:roomID},
    {
        name,description,maxVoiceParticipants,
        image:{
        url:photo?.url,
        public_id:photo?.public_id,  
        }
    },
    {new:true}
);

    res.status(200).json({success: true ,status: "success" ,message: "room updated" ,data:{updatedRoom}})
})

export{create,getAll,roomMessage,getRoom,changeStatus,getMyrooms,updateRoom};
