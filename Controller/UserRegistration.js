import UserModel from "../Models/UserModel.js";
import bcrypt from "bcrypt";

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

    res.json({
      msg: "Login successful",
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

export { AddUserData, Logindata };