import passport from "passport";
import { Strategy } from "passport-google-oauth20";
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

    let oldUser = await User.findOne({ googleId: profile.id }),
        user,
        email = profile.emails[0].value,
        emailInUse = await User.findOne({ email});


    if(oldUser) user = oldUser

    else if(emailInUse)
    {
      emailInUse.googleId = profile.id;
      emailInUse.provider.push("google");
      user = emailInUse;
    }

    else 
    {
      user = new User({
        name: profile.displayName,
        email: email,
        userName: String(profile.emails[0].value).slice(0,-10),
        provider:["google"],
        googleId:profile.id,
        isActive:true,
        state:null,
      });
    }

      let payload = {email: user.email,userID: user._id,userName: user.userName},
      accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET"),
      refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");
  
      user.refreshToken = refreshToken;
      user.accessToken = accessToken;

      await user.save();
      return done(null, user);

  }
  catch(err){
    done(err,null)
  }

}))

