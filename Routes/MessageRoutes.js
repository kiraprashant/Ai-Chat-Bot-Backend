
import express from "express";

import { AddChatMessage , GetMessagesByChatId } from "../Controller/ChatMessage.js";

const Router = express.Router();

Router.route("/").post(AddChatMessage);
Router.route("/Allmessage/:ChatId").get(GetMessagesByChatId);


export default Router;
