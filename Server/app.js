const express = require("express");
const app = express();
const cors = require("cors")
require('dotenv').config()
const ConnectDB = require("../ConnectionDatabase/Connection")
const UserRouter = require("../Routes/ChatRoutes")

// Port
const PORT = process.env.PORT || 3000 
app.use(cors())
app.use(express.json())
app.use("/api/ChatRoom",UserRouter)

// Basic GET API
app.get("/", (req, res) => {
  res.send("Hello! My first Node API 🚀");
});

// Another GET API (example)
app.get("/user", (req, res) => {
  res.json({
    name: "Prashant",
    role: "Developer",
    city: "Mumbai"
  });
});

// Start Server
app.listen(PORT, () => {
  ConnectDB()
  console.log(`Server running on http://localhost:${PORT}`);
});
