import { extractTokenFromSocket } from "../utils/extractToken.js";
import { AppError } from "../utils/appError.js";
import { socketWrapper } from "../middleware/asyncWrapper.js";
import jwt from "jsonwebtoken";
import { User } from "../modules/userSchema.js";

let socketAuth = socketWrapper(async(socket,next)=>{

    const token = extractTokenFromSocket(socket);

    if(!token)
        throw new AppError("you need to login",401,"fail");
 
    let decoded;
    
    try
    {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }
    catch(err)
    {
        throw new AppError("you need to login",401,"fail");
    }
    
    let user = await User.findById(decoded.userID)
    
    if(!user)
    {
        throw new AppError("Unauthorized",401,"fail")
    }

    socket.userID = user._id;
    socket.userName = user.userName;
    socket.profileImage = user.profileImage.url;

    next();

})

export {socketAuth}