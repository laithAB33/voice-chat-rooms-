import  Express  from "express";
import { deleteMessages } from "../controller/messageController.js";

let Router = Express.Router();

Router.route('').delete(deleteMessages);

export{Router};