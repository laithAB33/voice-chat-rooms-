import  Express  from "express";
import {verifyToken} from "../middleware/verifyToken.js" ;
import { upload } from "../middleware/multer.js";
import { create,getAll,roomMessage,getRoom,getMyrooms,updateRoom,banUser,deleteRoom } from "../controller/roomController.js";
import { roomUpdateValidate } from "../middleware/validate.js";

let Router = Express.Router();

Router.route('/').post(verifyToken,upload.single('image'),create)
                 .get(verifyToken,getAll)
                 .delete(verifyToken,upload.none(),banUser);
Router.route('/delete/:roomID').delete(verifyToken,upload.none(),deleteRoom)
Router.route('/myRooms').get(verifyToken,getMyrooms);
Router.route('/:roomID').get(verifyToken,getRoom);
Router.route('/:roomID/messages').get(verifyToken,roomMessage);
Router.route('/update/:roomID').patch(verifyToken,upload.single('image'),roomUpdateValidate,updateRoom);

export{Router};