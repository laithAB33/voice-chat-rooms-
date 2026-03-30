import  Express  from "express";
import {verifyToken} from "../middleware/verifyToken.js" ;
import { upload } from "../middleware/multer.js";
import { create,getAll,roomMessage,getRoom,changeStatus,getMyrooms,updateRoom } from "../controller/roomController.js";

let Router = Express.Router();

Router.route('/').post(verifyToken,upload.single('image'),create)
                 .get(verifyToken,getAll);
Router.route('/myRooms').get(verifyToken,getMyrooms);
Router.route('/:roomID').get(verifyToken,getRoom);
Router.route('/:roomID/messages').get(verifyToken,roomMessage);
Router.route('/active/:roomID').patch(verifyToken,changeStatus)
Router.route('/update/:roomID').patch(verifyToken,upload.single('image'),updateRoom)
export{Router};