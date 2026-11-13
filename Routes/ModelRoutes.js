import express from "express";
import Auth from "../Auth/Auth.js";


import {GenAI,getOllamaModels,UpdateTotalTokens} from "../Controller/AIIntegration/ChatModel.js"

const Router = express.Router();

Router.route("/chat-bot").post(GenAI);

Router.route("/List-Model").get(Auth,getOllamaModels);

Router.route("/Model-Usage-update").post(Auth,UpdateTotalTokens);




export default Router;