import { AppError } from "../utils/appError.js";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { Room } from "../modules/roomSchema.js";
import {Message} from "../modules/messageSchema.js";

let create = asyncWrapper(async(req,res,next)=>{

    let {name,description} = req.body;

    let room = new Room({
        name,
        description,
        createdBy:req.userID
    });

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
// test this later
let roomMessage = asyncWrapper(async(req,res,next)=>{

    let {roomID} = req.params;
    let {page = 1, limit = 50} = req.query;

    console.log(`${roomID}  ${page}   ${limit}`);

    let messages = await Message.find({roomID})
        .populate("userID","userName")
        .sort({createdAt:-1})
        .limit(limit)
        .skip((page - 1)*limit);

        res.status(200).json({success: true ,status: "success" ,message: "all the messages in the room" ,data:{messages} })

})

export{create,getAll,roomMessage};

// get users in one room