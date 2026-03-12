import { User } from "../modules/userSchema.js";

let assignUser = (req,hashedPassword)=>{

    let {name,userName,email} = req.body;

    let newUser = new User({
        name,
        userName,
        email,
        password:hashedPassword,
        isActive:false,
        provider:["email"],
    })

    return newUser;
}

export {assignUser};