import express from "express";


import {GenAI,getOllamaModels,UpdateTotalTokens} from "../Controller/AIIntegration/ChatModel.js"

const Router = express.Router();

Router.route("/chat-bot").post(GenAI);

Router.route("/List-Model").get(getOllamaModels);

Router.route("/Model-Usage-update").post(UpdateTotalTokens);




export default Router;