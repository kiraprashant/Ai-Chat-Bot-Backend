import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  Title: {
    type: String,
    required: true,
    trim: true,
  },

  Created_At: {
    type: Date,
    default: Date.now,
  },
});

const ChatHistoryModel = mongoose.model(
  "ChatHistory",
  ChatHistorySchema
);

export default ChatHistoryModel;