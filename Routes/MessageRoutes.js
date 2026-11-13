
import express from "express";

import { AddChatMessage , GetMessagesByChatId } from "../Controller/ChatMessage.js";
import Auth from "../Auth/Auth.js"

const Router = express.Router();

Router.route("/").post(Auth,AddChatMessage);
Router.route("/Allmessage/:ChatId").get(Auth,GetMessagesByChatId);


export default Router;
