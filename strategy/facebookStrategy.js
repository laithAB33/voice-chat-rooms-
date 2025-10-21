import passport from "passport";
import { Strategy } from "passport-facebook";
import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { User } from "../modules/userSchema.js";

passport.use(new Strategy({

    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email'],
    enableProof: true

},asyncWrapper(async(accessToken, refreshToken, profile, done)=>{

    console.log('Facebook Profile:', profile , "\n");

    let user = await User.findOne({ facebookId: profile.id });

    if (user)
    {
        user.accessToken = accessToken;
        await user.save();
        return done(null, user);
    }

    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user)
    {
      user.facebookId = profile.id;
      user.accessToken = accessToken;
      await user.save();
      return done(null, user);
    }

    const newUser = new User({
        facebookId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        accessToken: accessToken,
        userName: String(profile.emails[0].value).slice(0,-10),
      });
  
      await newUser.save();
      return done(null, newUser);

      

})))