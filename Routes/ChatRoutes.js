import express from "express";

import {
  AddUserData,
  Logindata,
  updateProfile,
  GetProfileById
} from "../Controller/UserRegistration.js";
import Auth from "../Auth/Auth.js";



const Router = express.Router();

Router.route("/AddUser").post(AddUserData);

Router.route("/Login").post(Logindata);

Router.put("/profile", Auth, updateProfile);

Router.get("/profile", Auth, GetProfileById);




export default Router;