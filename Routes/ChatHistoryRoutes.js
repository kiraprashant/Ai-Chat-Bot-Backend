import express from "express";

import {
  AddChatHistory,
  GetChatHistory,
  GetChatById,
  DeleteChatHistory,
} from "../Controller/ChatHistory.js";

const Router = express.Router();

Router.route("/").post(AddChatHistory);
Router.route("/GetChatHistory").post(GetChatHistory);
Router.route("/:ChatId")
  .get(GetChatById)
  .delete(DeleteChatHistory);

export default Router;