
import ChatMessageModel from "../Models/ChatMessageModel.js";

export const AddChatMessage = async (req, res) => {
  try {
    const { ChatId, MessageId, Name, Content , Role} = req.body;
    console.log("ChatId" , ChatId)
    console.log("MessageId ", MessageId)
    console.log("Name" , Name)
    console.log("Content " , Content)
    console.log("Role ", Role)

    if (
      !ChatId ||
      !MessageId ||
      !Name ||
      !Role ||
      typeof Content !== "string" ||
      !Content.trim()
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please provide all required message details",
      });
    }

    const newMessage = await ChatMessageModel.create({
      ChatId,
      MessageId,
      Name,
      Role,
      Content: Content.trim(),
    //   ...(time && { time }),
    });

    return res.status(201).json({
      success: true,
      msg: "Chat message added successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("AddChatMessage error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to add chat message",
    });
  }
};


export const GetMessagesByChatId = async (req, res) => {
    try {
        const { ChatId } = req.params;
  
      if (!ChatId) {
        return res.status(400).json({
          success: false,
          msg: "ChatId is required",
        });
      }
  
      const messages = await ChatMessageModel.find({ ChatId }).sort({
        time: 1,
      });
  
      return res.status(200).json({
        success: true,
        msg: "Chat messages retrieved successfully",
        data: messages,
      });
    } catch (error) {
      console.error("GetMessagesByChatId error:", error);
  
      return res.status(500).json({
        success: false,
        msg: "Failed to retrieve chat messages",
      });
    }
  };
  

export default { AddChatMessage , GetMessagesByChatId };
