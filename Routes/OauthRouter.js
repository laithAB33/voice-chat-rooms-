import  Express  from "express";
import { sendSuccessResponse, sendErrorResponse } from "../view/responeForm.js";
import { genrateToken } from "../utils/genrateToken.js";
import passport from "passport";
import crypto from "crypto";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { AppError } from "../utils/appError.js";
import { upload } from "../middleware/multer.js";
import { User } from "../modules/userSchema.js";

let Router = Express.Router();

Router.route('/google').get(passport.authenticate('google',{
    session:false,
    scope:[
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'openid'
    ],
    accessType:'offline',
    prompt:'consent'
}),(req,res,next)=>{
    

})


Router.route('/google/callback').get((req,res,next)=>{

    passport.authenticate('google',{session:false,},async(err,user)=>{
    
        if(err) return sendErrorResponse(res,err.message)
    
        try{
    
            
            let state = crypto.randomBytes(32).toString("hex") + user.googleId;

            await User.findOneAndUpdate({_id:user._id},{state}) ;
                
            console.log(state);

            return res.redirect(`voxchat://auth-success?state=${state}`)

        }catch(err){
            
            return sendErrorResponse(res,err.message)
        }
    
    })(req,res,next);
})


Router.route('/tokens').post(upload.none(),asyncWrapper(async(req,res,next)=>{

    let {state} = req.body;

    let user = await User.findOne({state});

    console.log(user);
    if(!user) return next(new AppError("invalid state",400,"fail"));
    if(user.expire < Date.now()) return next(new AppError("expired state",404,"fail"));

    let payload = {email:user.email,userID:user.userID,userName:user.userName};
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    await user.save();

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

    res.status(200).json({success: true ,status:"success",message: "the tokens have been set up" ,
    data:{
        id:user._id,
        userName:user.userName,
        accessToken
    }});

}))

export {Router}