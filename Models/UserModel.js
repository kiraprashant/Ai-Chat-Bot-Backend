
import mongoose from "mongoose";
import moment from "moment";

const currentDate = moment().format("DD-MM-YY");

const userSchema = new mongoose.Schema({
  FullName: {
    type: String,
    required: true,
  },

  Email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  Password: {
    type: String,
    required: true,
  },

  Address: {
    type: String,
    trim: true,
    default: "",
  },

  Contact: {
    type: String,
    trim: true,
    default: "",
  },

  DOB: {
    type: Date,
    default: null,
  },

  Created_At: {
    type: String,
    default: currentDate,
  },

  totalTokens: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
