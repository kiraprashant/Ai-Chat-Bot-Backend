
import ChatHistoryModel from "../Models/ChatHistoryModel.js";

// Create chat history
export const AddChatHistory = async (req, res) => {
  try {
    const { ChatId, Title, Email, Created_At} = req.body;

    if (!ChatId || !Title || !Email || !Created_At) {
      return res.status(400).json({
        success: false,
        msg: "ChatId, name, and email are required",
      });
    }

    const chatHistory = await ChatHistoryModel.create({
      ChatId,
      Title,
      Email,
      Created_At
    });

    return res.status(201).json({
      success: true,
      msg: "Chat history created successfully",
      data: chatHistory,
    });
  } catch (error) {
    console.error("AddChatHistory error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to create chat history",
    });
  }
};

// Get all chats for a user
export const GetChatHistory = async (req, res) => {
  try {
    const { Email } = req.body;


    if (!Email) {
        return res.status(400).json({
          success: false,
          msg: "Email is required",
        });
      }

    const chatHistory = await ChatHistoryModel.find({ Email })
      .sort({ Created_At: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: chatHistory,
    });
  } catch (error) {
    console.error("GetChatHistory error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch chat history",
    });
  }
};

// Get one chat by ChatId
export const GetChatById = async (req, res) => {
  try {
    const { ChatId } = req.params;

    const chat = await ChatHistoryModel.findOne({ ChatId }).lean();

    if (!chat) {
      return res.status(404).json({
        success: false,
        msg: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("GetChatById error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to fetch chat",
    });
  }
};

// Delete chat history
export const DeleteChatHistory = async (req, res) => {
  try {
    const { ChatId } = req.params;

    const deletedChat = await ChatHistoryModel.findOneAndDelete({ ChatId });

    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        msg: "Chat not found",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Chat history deleted successfully",
    });
  } catch (error) {
    console.error("DeleteChatHistory error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to delete chat history",
    });
  }
};


export default {
    AddChatHistory,
    GetChatHistory,
    GetChatById,
    DeleteChatHistory,
  };