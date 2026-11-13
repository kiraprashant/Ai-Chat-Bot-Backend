import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({

  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  ChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChatHistory",
    required: true,
    index: true,
  },

  MessageId: {
    type: String,
    required: true,
    index: true,
  },

  Name: {
    type: String,
    required: true,
  },

  Role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },

  Content: {
    type: String,
    required: true,
  },

  Model: {
    type: String,
    default: null,
  },

  Time: {
    type: Date,
    default: Date.now,
  },

});

const ChatMessageModel = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessageModel;
