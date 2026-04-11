import  Express  from "express";
import { deleteMessages } from "../controller/messageController.js";
import { upload } from "../middleware/multer.js";

let Router = Express.Router();

Router.route('').delete(upload.none(),deleteMessages);

export{Router};