import { asyncWrapper } from "./asyncWrapper.js";
import {User} from "../modules/userSchema.js";
import {AppError} from "../utils/appError.js";

let userUpdateValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body,validData = {};

    if(data.name)validData.name = data.name;
    if(data.userName)validData.userName = data.userName;
    if(data.deleteImage)validData.deleteImage = data.deleteImage; 

    req.body = validData;

    next();
})

export {userUpdateValidate};