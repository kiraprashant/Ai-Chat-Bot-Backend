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

  name: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  time: {
    type: Date,
    default: Date.now,
  },
});

const ChatMessageModel = mongoose.model(
  "ChatMessage",
  ChatMessageSchema
);

export default ChatMessageModel;