import  Express  from "express";
import {register,login,test,logout,refreshToken,deleteUser,addAvatar,update,getNewMessages,getNewInvitation} from "../controller/userController.js";
import {verifyToken} from "../middleware/verifyToken.js" ;
import { upload } from "../middleware/multer.js";
import { userUpdateValidate } from "../middleware/userValidate.js";
let Router = Express.Router();

Router.route('/')
                .post(upload.none(),register)
                .get(upload.none(),login)
                .delete(verifyToken,deleteUser)
                .patch(verifyToken,upload.single('image'),userUpdateValidate,update);


Router.route('/avater').post(verifyToken,upload.single('image'),addAvatar);

Router.route('/logout').delete(verifyToken,logout);

Router.route('/info').get(verifyToken,test);

Router.route('/refresh').patch(refreshToken);

Router.route('/newMessages').get(verifyToken,getNewMessages)
Router.route('/newInvitation').get(verifyToken,getNewInvitation)


export{Router};