
import { ChatOllama } from "@langchain/ollama";
import UserModel from "../../Models/UserModel.js";
import { tool } from "@langchain/core/tools";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { z } from "zod";
import "dotenv/config";


const model = new ChatOllama({
  model: "gemma4:31b-cloud",
  temperature: 0.7,
});


const searchWeb = tool(
  async ({ query }) => {
    const response = await fetch(
      "https://api.tavily.com/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          max_results: 5,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Tavily error: ${response.status}`);
    }

    const data = await response.json();

    return JSON.stringify(
      data.results.map((item) => ({
        title: item.title,
        url: item.url,
        content: item.content,
      }))
    );
  },
  {
    name: "search_web",
    description:
      "Search the internet when the user explicitly asks to use the internet or net needs current information.",
    schema: z.object({
      query: z.string(),
    }),
  }
);

const modelWithTools = model.bindTools([searchWeb]);


 

const getOllamaModels = async(req,res) => {
  try {
    const response = await fetch(
      "http://localhost:11434/api/tags"
    );

    if (!response.ok) {
      console.log(response.status)
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    const models = data.models.map((model) => ({
      name: model.name,
      size: `${(model.size / 1024 ** 3).toFixed(2)} GB`,
      family: model.details.family,
      parameters: model.details.parameter_size,
      quantization: model.details.quantization_level,
    }));

    console.log(models);

    res.json({
      msg:"success",
      Models:models
    })


  } catch (error) {
    console.error("Failed to fetch Ollama models:", error.message);
    return res.status(503).json({
      success: false,
      msg: "Unable to connect to Ollama. Please check whether Ollama is running.",
    });
  }
}



const GenAI = async (req, res) => {
  try {
    // const { question } = req.body;

    // if (typeof question !== "string" || !question.trim()) {
    //   return res.status(400).json({
    //     success: false,
    //     msg: "Please provide a question",
    //   });
    // }

    const { messages: chatHistory } = req.body;

if (
  !Array.isArray(chatHistory) ||
  chatHistory.length === 0 ||
  !chatHistory.every(
    (m) =>
      ["user", "assistant"].includes(m.role) &&
      typeof m.content === "string" &&
      m.content.trim()
  )
) {
  return res.status(400).json({
    success: false,
    msg: "Please provide valid conversation messages",
  });
}

    const messages = [
      new SystemMessage(`
        You are a helpful AI assistant.
        Explain concepts simply and provide code examples.

        You have access to a search_web tool.

        If the user explicitly asks to use the internet,
        you MUST use search_web before answering.

        For questions about current information, use search_web.
        For ordinary questions, answer from your existing knowledge
        when web research is unnecessary.
      `),
     
  ...chatHistory.map((message) =>
    message.role === "user"
      ? new HumanMessage(message.content)
      : new AIMessage(message.content)
  ),
    ];

    let searchedWeb = false;
    let totalTokens = 0;

    // Allow up to 5 model/tool iterations
    for (let i = 0; i < 5; i++) {
      const response = await modelWithTools.invoke(messages);

      messages.push(response);

      totalTokens +=
        response.usage_metadata?.total_tokens ?? 0;

        console.log("response.tool_calls?.length " , response.tool_calls?.length)

      // If no tool is requested, return the final answer
      if (!response.tool_calls?.length) {
        return res.status(200).json({
          success: true,
          content: response.content,
          searchedWeb,
          usage: {
            total_tokens: totalTokens,
          },
        });
      }

      // Execute requested tools
      for (const call of response.tool_calls) {
        if (call.name === "search_web") {
          searchedWeb = true;

          try {
            const result = await searchWeb.invoke(call.args);

            console.log("result :: ", result)

            messages.push(
              new ToolMessage({
                content: result,
                tool_call_id: call.id,
              })
            );
          } catch (error) {
            messages.push(
              new ToolMessage({
                content: `Search failed: ${error.message}`,
                tool_call_id: call.id,
              })
            );
          }
        }
      }
    }

    return res.status(502).json({
      success: false,
      msg: "Maximum tool-call limit reached",
    });
  } catch (error) {
    console.error("GenAI Error:", error);

    return res.status(500).json({
      success: false,
      msg: "Failed to generate an AI response",
    });
  }
};


const UpdateTotalTokens = async (req, res) => {
  try {
    const { Email, tokens } = req.body;

    // Validate input
    if (
      !Email ||
      !Number.isSafeInteger(tokens) ||
      tokens <= 0
    ) {
      return res.status(400).json({
        Success: false,
        msg: "Valid Email and positive token count are required",
      });
    }

    // Fetch existing user and increment total tokens
    const UpdatedUser = await UserModel.findOneAndUpdate(
      { Email },
      {
        $inc: { totalTokens: tokens },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("FullName Email totalTokens");

    // Check user exists
    if (!UpdatedUser) {
      return res.status(404).json({
        Success: false,
        msg: "User Not Found",
      });
    }

    return res.status(200).json({
      Success: true,
      msg: "Tokens Updated Successfully",
      User: UpdatedUser,
    });
  } catch (error) {
    console.error("Update Tokens Error:", error);

    return res.status(500).json({
      Success: false,
      msg: "Failed to Update Tokens",
    });
  }
};

export default UpdateTotalTokens;

// GenAI().catch(console.error);
export { GenAI , getOllamaModels , UpdateTotalTokens};
