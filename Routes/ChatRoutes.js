const express = require("express")
const Router = express.Router()

const {AddUserData} = require("../Controller/UserRegistration")
 


Router.route("/AddUser").post(AddUserData)










module.exports = Router