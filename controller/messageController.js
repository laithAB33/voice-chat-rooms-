import {asyncWrapper} from "../middleware/asyncWrapper.js"
import { Message } from "../modules/messageSchema.js";

let deleteMessages = asyncWrapper(async(req,res,next)=>{

    let messages = req.body.messages;

    messages = JSON.parse(messages)

    let result = await Message.deleteMany({ _id:{$in:messages}});

    res.status(200).json({success:true, status:"success", message:"messages deleted", data:{result}})

})

export{deleteMessages}