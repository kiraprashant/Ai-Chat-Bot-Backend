const mongoose = require("mongoose");
const moment = require("moment")

const currentDate = moment().format("DD-MM-YY");

const userSchema = new mongoose.Schema(
  {
    FullName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password:{
        type: String,
        required: true, 
    },
    Created_At:{
        type:String,
        default:currentDate,
    }
  },
  
);

module.exports = mongoose.model("User", userSchema);