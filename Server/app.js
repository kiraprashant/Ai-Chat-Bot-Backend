import express from "express";
import cors from "cors";
import "dotenv/config";

import ConnectDB from "../ConnectionDatabase/Connection.js";
import UserRouter from "../Routes/ChatRoutes.js";
import ModelRouter from "../Routes/ModelRoutes.js";
import ChatHistoryRoute from "../Routes/ChatHistoryRoutes.js"
import MessageRoutes from "../Routes/MessageRoutes.js"


const app = express();

// Port
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/ChatRoom", UserRouter);
app.use("/api/ChatModel", ModelRouter);
app.use("/api/ChatHistory", ChatHistoryRoute);
app.use("/api/Message", MessageRoutes);

// Basic GET API
app.get("/", (req, res) => {
  res.send("Hello! My first Node API 🚀");
});

// Another GET API (example)
app.get("/user", (req, res) => {
  res.json({
    name: "Prashant",
    role: "Developer",
    city: "Mumbai",
  });
});

// Start Server
app.listen(PORT, async () => {
  await ConnectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});