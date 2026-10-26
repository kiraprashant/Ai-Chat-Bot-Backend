import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({


  ChatId: {
    type: String,
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
    required: true,
  },

  Content: {
    type: String,
    required: true,
  },

  Time: {
    type: Date,
    default: Date.now,
  },
});

const ChatMessageModel = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessageModel;
