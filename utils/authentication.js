import bcryptjs from 'bcryptjs';
import {AppError} from './appError.js';

async function authentication(UserPass,DBpassword){

    let auth = await bcryptjs.compare(UserPass,DBpassword);
    if(!auth){
        let error = new AppError("invalid password",400, "fail");
        throw error;
    }

}

export {authentication};