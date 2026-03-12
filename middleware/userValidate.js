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

let userRegisterValidate = asyncWrapper(async(req,res,next)=>{

    let {email,password} = req.body;

    let checkOld = await User.findOne({email:email});

    if(checkOld && !checkOld.isActive) await checkOld.deleteOne();
    else if(checkOld ) return next(new AppError("invalid email or password",400,"fail"));
    
    if(password.length <8)return next(new AppError("password too short",400,"fail"));

    next();
})

export {userUpdateValidate,userRegisterValidate};