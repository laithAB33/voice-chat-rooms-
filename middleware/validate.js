import { asyncWrapper } from "./asyncWrapper.js";
import {User} from "../modules/userSchema.js";
import {AppError} from "../utils/appError.js";
import isBoolean from "validator/lib/isBoolean.js";

let userUpdateValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body,validData = {};

    if(data.name)validData.name = data.name;
    if(data.userName)validData.userName = data.userName;
    if(data.deleteImage)validData.deleteImage = data.deleteImage; 

    req.body = validData;

    next();
})

let roomUpdateValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body;

    if(  data.name && (data.name?.length<4  || data.name == "")) return next(new AppError("not a valid name",400,"fail"));

    if( ( data.description && data.description.length>400 ) || data.description == "") return next(new AppError("not a valid description",400,"fail"));

    if((data.maxVoiceParticipants && ( isNaN(data.maxVoiceParticipants) || data.maxVoiceParticipants === null || data.maxVoiceParticipants === "" || Number(data.maxVoiceParticipants) > 15) ) || data.maxVoiceParticipants === "" )
    return next(new AppError("not a valid number for maxVoiceParticipants",400,"fail"));

    if(data.chatActive && data.chatActive != "active" && data.chatActive != "notactive" )return next(new AppError("not a valid value for chatActive",400,"fail"));

    if(data.isActive  && data.isActive  != "active" && data.isActive  != "notactive")return next(new AppError("not a valid value for isActive",400,"fail"));

    if(data.password.length < 5 ) return next(new AppError("password is too short",400,"fail"));

    next();
})

export {userUpdateValidate,roomUpdateValidate};