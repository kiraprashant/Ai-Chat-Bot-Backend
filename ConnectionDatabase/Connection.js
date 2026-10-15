import mongoose from "mongoose";
import "dotenv/config";

const url = process.env.DB_URL;

const connectDB = async () => {
  try {
    console.log("Attempting to connect to the database...");

    await mongoose.connect(url, {
      writeConcern: { w: "majority" },
    });

    console.log("Mongo URI:", url);
    console.log(
      "Connected to the database successfully.",
      mongoose.connection.name
    );
  } catch (e) {
    console.error("Error connecting to the database:", e);
    console.log("Connection failed.");
  }
};

export default connectDB;