import {asyncWrapper} from "../middleware/asyncWrapper.js";
import { User } from "../modules/userSchema.js";
import {AppError} from "../utils/appError.js";
import bcryptjs from "bcryptjs";
import { genrateToken } from "../utils/genrateToken.js";
import { authentication } from "../utils/authentication.js";
import  jwt  from "jsonwebtoken";
import { assignUser } from "../utils/assignObject.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import { cloudinary } from "../utils/cloudinary.js";

let register = asyncWrapper(async (req,res,next)=>{

    let {email,password} = req.body;

    let hashedPassword = bcryptjs.hashSync(password);

    let newUser = assignUser(req,hashedPassword);

        await newUser.save();

    

        let payload = {email,userID:newUser._id,userName:newUser.userName};
        const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
        const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");
    
        newUser.refreshToken = refreshToken;
    
            await newUser.save();
    
        res.cookie("refreshToken",refreshToken,{
            maxAge:1000 * 60 * 60 *24 * 365 ,
            httpOnly:true,
            secure : process.env.NODE_ENV == 'production',
            samesite: 'strict',
        })
    
        res.cookie("accessToken",accessToken,{
            maxAge:1000 * 60 * 30,
            httpOnly:true,
            secure : process.env.NODE_ENV == 'production',
            samesite: 'strict',
        })
    
        res.status(201).json({success: true ,status:"success",message: "user created successflly" ,
        data:{
            id:newUser._id,
            userName:newUser.userName,
            accessToken
        }});

})

let login = asyncWrapper(async (req,res,next)=>{

    let {email,password} = req.body;
   
    let oldUser = await User.findOne({email,provider:"email"});

    if(!oldUser){
        return next(new AppError("invalid email or password",400,"fail"));
    }

    await authentication(password,oldUser.password);

    let payload = {email,userID:oldUser._id,userName:oldUser.userName};
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    oldUser.refreshToken = refreshToken;

    await oldUser.save();

    res.cookie("refreshToken",refreshToken,{
        maxAge:1000 * 60 * 60 *24 * 365 ,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.cookie("accessToken",accessToken,{
        maxAge:1000 * 60 * 30,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.status(200).json({success: true ,status:"success",message: "user logged in successflly" ,
    data:{
        id:oldUser._id,
        userName:oldUser.userName,
        accessToken
    }})

})

let test = asyncWrapper(async(req,res,next)=>{

    let user = await User.findOne({_id:req.userID});

    res.status(200).json({
        success:true,
        data:{
            name:user.name,
            userName:req.userName,
            email:req.email,
            userID:req.userID,
            profileImage:user.profileImage.url,
            accessToken:req.cookies?.accessToken
        }
    });
})

let logout = asyncWrapper(async(req,res,next)=>{

    if(!req.cookies?.refreshToken){
        return res.status(200).json({success:true, status:"success", message:"you already logout", data:null})
    }

    const refreshToken = req.cookies.refreshToken;

    let foundUser = await User.findOne({refreshToken});

    if(!foundUser){
        res.clearCookie("refreshToken",{httpOnly:true})
        return res.status(200).json({success:true, status:"success", message:"you have already logged out", data:null})
    }

    foundUser.refreshToken = null;

    await foundUser.save();

    res.clearCookie("refreshToken",{httpOnly:true})
    res.clearCookie("accessToken",{httpOnly:true})
    res.status(200).json({success:true, status:"success", message:"you logged out", data:null})

})

let refreshToken = asyncWrapper(async(req,res,next)=>{

    if(!req.cookies?.refreshToken)
        return next(new AppError("Unauthorized. Please login to access this resource",401,"fail"));
    
    let oldRefreshToken = req.cookies.refreshToken;

    let foundUser = await User.findOne({refreshToken:oldRefreshToken});
    
    if(!foundUser)
        return next(new AppError("Unauthorized",401,"fail"));
    
    let decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    if(decoded.userID !=foundUser._id)
         return next(new AppError("Unauthorized",401,"fail"));
    
    req.userID = decoded.id;
    req.email = decoded.email;
    req.userName = decoded.userName;

    let payload = {email:foundUser.email,userID:foundUser._id,userName:foundUser.userName}
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    foundUser.refreshToken = refreshToken;

    await foundUser.save();

    res.cookie("refreshToken",refreshToken,{
        maxAge:1000 * 60 * 60 *24 * 365 ,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.cookie("accessToken",accessToken,{
        maxAge:1000 * 60 * 30,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.status(200).json({success:true,status:"success",message:"the session is updated successfully",
    data:{
        accessToken
    }});

})

let deleteUser = asyncWrapper(async(req,res,next)=>{

    let foundUser = await User.findOne({_id:req.userID});

    if(!foundUser){

        return res.status(200).json({success:true, status:"success", message:"you have already deleted the user", data:null})
    }

    let userName = foundUser.userName;

    let profileImage = foundUser.profileImage;

    if(profileImage.public_id)await cloudinary.uploader.destroy(profileImage.public_id);        
    
    await foundUser.deleteOne();
    
    res.clearCookie("refreshToken",{httpOnly:true});
    res.clearCookie("accessToken",{httpOnly:true});


    res.status(200).json({success:true, status:"success", message:"user deleted", data:{userName}})

})

let addAvatar = asyncWrapper(async(req,res,next)=>{

    if(!req.file)
    {
        return next(new AppError("Please provide a picture of the item",400,"fail"));
    }

    let photo

    try{ photo = await uploadToCloudinary(req) }
    catch(err){
        return next(new AppError("error uploading image",500,"error"));
    }

    let user = await User.findOneAndUpdate({_id:req.userID},{
        profileImage: {
            url:photo.url,
            public_id:photo.public_id,  
    }})

    if(!user) return next(new AppError("invalid email",400,"fail"));

    let profileImage = user.profileImage;
    if(profileImage?.public_id)await cloudinary.uploader.destroy(profileImage.public_id);

    res.status(201).json({success:true, status:"success", message:"added a profileImage",
    data:{
        userID:req.userID,
        imageURL:photo.url
    }})

})

let update = asyncWrapper(async(req,res,next)=>{

    let data = req.body,photo;

    let user = await User.findOne({_id:req.userID});

    if(!user)
    {
        let error = new AppError("user not found",400,"fail");
        return next(error);
    } 

    if(Boolean(Number(data.deleteImage)))
    {
        if(user.profileImage.public_id)
        await cloudinary.uploader.destroy(user.profileImage.public_id);
        user.profileImage.url = null;
        user.profileImage.public_id = null;
    }

    Object.assign(user,data);

    await user.save();

    res.status(200).json({success:true,status:"success",message:"the user was updated",data:{userName:user.userName}});

})


export{register,login,test,logout,refreshToken,deleteUser,addAvatar,update};

