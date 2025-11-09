import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../modules/userSchema.js";
import { genrateToken } from "../utils/genrateToken.js";

export default passport.use(new Strategy({

    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK,
    scope: ['profile','email'],
    passReqToCallback:true,
    accessType:'offline',
    // prompt: 'consent'

},async(req,access, refresh, profile, done)=>{
  try{

    let user = await User.findOne({ googleId: profile.id });

    if(user)
    {
        let payload = {email:user.email,userID:user._id,userName:user.userName},
        accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET"),
        refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        
        await user.save();
        return done(null, user);
    }

    const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        userName: String(profile.emails[0].value).slice(0,-10),
        provider:"google",
        googleId:profile.id,
      });

      let payload = {email: newUser.email,userID: newUser._id,userName: newUser.userName},
      accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET"),
      refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");
  
      newUser.refreshToken = refreshToken;
      newUser.accessToken = accessToken;

      await newUser.save();
      return done(null, newUser);

  }
  catch(err){
    console.log("err",err);
    done(err,null)
  }

}))

