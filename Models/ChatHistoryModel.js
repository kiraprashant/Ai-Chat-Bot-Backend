import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema({
  ChatId: {
    type: String,
    required: true,
    index: true,
  },

  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  Created_At: {
    type: Date,
    default: Date.now,
  },
});

const ChatHistoryModel = mongoose.model("ChatHistory", ChatHistorySchema);

export default ChatHistoryModel;