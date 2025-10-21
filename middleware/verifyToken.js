import jwt from "jsonwebtoken";
import {AppError} from '../utils/appError.js';

let verifyToken = (req,res,next)=>{

    let token = req.cookies?.accessToken;
    let decoded;

    try{
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }catch(err){

            let error = new AppError("you need to sign up or sign in",401,"fail");
            return next(error);
    }
    req.userID = decoded.userID;
    req.email = decoded.email;
    req.userName = decoded.userName;
    next();
}

export{verifyToken};