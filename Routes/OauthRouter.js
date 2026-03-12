import  Express  from "express";
import { sendSuccessResponse, sendErrorResponse } from "../view/responeForm.js";
import { genrateToken } from "../utils/genrateToken.js";
import passport from "passport";

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
    
            let payload = {email:user.email,userID:user._id,userName:user.userName}
    
            let accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET"),
            refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");
            
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

            sendSuccessResponse(res,user);

        }catch(err){
            
            return sendErrorResponse(res,err.message)
        }
    
    })(req,res,next);
})

export {Router}