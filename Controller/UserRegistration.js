import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AddUserData = async (req, res) => {
  console.log(req.body);

  try {
    const GetEmail = await UserModel.findOne({
      Email: req.body.Email,
    });

    console.log("Email", GetEmail);
    console.log(req.body.Email);

    if (GetEmail) {
      return res.status(400).json({
        Success: false,
        msg: "Email Already Exist",
      });
    }

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(
      req.body.Password,
      saltRounds
    );

    console.log("hashedPassword", hashedPassword);

    await UserModel({
      FullName: req.body.FullName,
      Email: req.body.Email,
      Password: hashedPassword,
    }).save();

    res.json({
      Success: true,
      msg: "User SuccessFully Register",
    });
  } catch (e) {
    console.log(e);

    res.status(400).json({
      Success: false,
      msg: "User Registration Failed",
    });
  }
};

const Logindata = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Find user
    const user = await UserModel.findOne({ Email });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      Password,
      user.Password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        Email: user.Email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    res.cookie(
      "token", token, 
      {
      httpOnly: true,
      secure: false, // Local HTTP development
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.FullName,
        email: user.Email,
      },
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      msg: "Server error",
    });
  }
};

 const updateProfile = async (req, res) => {
  try {
    const { FullName, Address, Contact, DOB } = req.body;

    // Allow only profile fields
    // const allowedFields = {};

    // if (FullName !== undefined) allowedFields.FullName = FullName;
    // if (Address !== undefined) allowedFields.Address = Address;
    // if (Contact !== undefined) allowedFields.Contact = Contact;
    // if (DOB !== undefined) allowedFields.DOB = DOB;

    // if (Object.keys(allowedFields).length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "No profile fields provided",
    //   });
    // }

    // Replace req.user.id with your authenticated user's ID field
    const user = await UserModel.findByIdAndUpdate(
      req.user.userId,
      {
        FullName: req.body.FullName,
        Address: req.body.Address,
        Contact: req.body.Contact,
        DOB: req.body.DOB,
      },
      { new: true }
    );
    

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};


 const GetProfileById = async (req, res) => {
  try {

   console.log("Cookie header:", req.headers.cookie);
   console.log("Parsed cookies:", req.cookies);
    const userId = req.user.userId;

    console.log("userId :", userId)

    const user = await UserModel.findById(userId).select("-Password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Profile retrieved successfully",
      user: {
        _id: user._id,
        FullName: user.FullName,
        Email: user.Email,
        Address: user.Address,
        Contact: user.Contact,
        DOB: user.DOB,
        Created_At: user.Created_At,
        totalTokens: user.totalTokens,
      },
    });
  } catch (error) {
    console.error("GetProfileById error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to retrieve profile",
    });
  }
};

export { AddUserData, Logindata , updateProfile , GetProfileById };