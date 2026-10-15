import express from "express";

import {
  AddUserData,
  Logindata,
} from "../Controller/UserRegistration.js";

const Router = express.Router();

Router.route("/AddUser").post(AddUserData);

Router.route("/Login").post(Logindata);

export default Router;