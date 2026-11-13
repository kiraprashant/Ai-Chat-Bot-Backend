import express from "express";

import {
  AddChatHistory,
  GetChatHistory,
  GetChatById,
  DeleteChatHistory,
} from "../Controller/ChatHistory.js";
import Auth from "../Auth/Auth.js";

const Router = express.Router();

Router.route("/").post(Auth,AddChatHistory);
Router.route("/GetChatHistory").post(Auth,GetChatHistory);
Router.route("/:ChatId")
  .get(GetChatById)
  .delete(DeleteChatHistory);

export default Router;