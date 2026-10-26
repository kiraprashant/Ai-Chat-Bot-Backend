
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




 

const getOllamaModels = async(req,res) => {
  try {
    const response = await fetch(
      "https://ollama.com/api/tags"
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
    const {
      messages: chatHistory,
      model: modelName = "qwen3.5:2b",
    } = req.body;

    if (
      !Array.isArray(chatHistory) ||
      chatHistory.length === 0 ||
      !chatHistory.every(
        (m) =>
          ["user", "assistant"].includes(m.role) ||  ["user", "assistant"].includes(m.Role) &&
          typeof m.content === "string" || typeof m.Content === "string" && m.content.trim() || m.Content.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        msg: "Please provide valid conversation messages",
      });
    }

    // const model = new ChatOllama({
    //   model: modelName,
    //   temperature: 0.7,
    // });

    const model = new ChatOllama({
      model: modelName,
      baseUrl: "https://ollama.com",
      headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
      },
    });

    const modelWithTools = model.bindTools([searchWeb]);

    const messages = [
      new SystemMessage(`
        You are a helpful AI assistant.
        Explain concepts simply and provide code examples.

        You have access to a search_web tool.
        If the user explicitly asks to use the internet,
        use search_web before answering.
        For current information, use search_web.
      `),

      ...chatHistory.map((message) =>
        message.role === "user"
          ? new HumanMessage(message.content)
          : new AIMessage(message.content)
      ),
    ];

    let searchedWeb = false;
    let totalTokens = 0;

    // Configure streaming response
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Handle disconnects
    let disconnected = false;
    res.on("close", () => {
      disconnected = true;
    });

    for (let i = 0; i < 5; i++) {
      if (disconnected) return;

      let fullResponse = null;
      let streamedText = "";

      // Stream model output
      for await (const chunk of await modelWithTools.stream(messages)) {
        if (disconnected) return;

        fullResponse = fullResponse
          ? fullResponse.concat(chunk)
          : chunk;

        const text =
          typeof chunk.content === "string"
            ? chunk.content
            : "";

        if (text) {
          streamedText += text;

          sendEvent({
            type: "token",
            content: text,
          });
        }
      }

      if (!fullResponse) {
        throw new Error("The model returned an empty response");
      }

      totalTokens +=
        fullResponse.usage_metadata?.total_tokens ?? 0;

      messages.push(fullResponse);

      // No tool calls: the answer is complete
      if (!fullResponse.tool_calls?.length) {
        sendEvent({
          type: "done",
          success: true,
          AIModel: modelName,
          searchedWeb,
          usage: {
            total_tokens: totalTokens,
          },
        });

        return res.end();
      }

      // Execute tool calls before continuing the model loop
      for (const call of fullResponse.tool_calls) {
        if (call.name !== "search_web") {
          messages.push(
            new ToolMessage({
              content: `Unsupported tool: ${call.name}`,
              tool_call_id: call.id,
            })
          );
          continue;
        }

        searchedWeb = true;

        try {
          const result = await searchWeb.invoke(call.args);

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

    sendEvent({
      type: "error",
      message: "Maximum tool-call limit reached",
    });

    return res.end();
  } catch (error) {
    console.error("GenAI streaming error:", error);

    if (res.headersSent) {
      res.write(
        `data: ${JSON.stringify({
          type: "error",
          message: "Failed to generate AI response",
        })}\n\n`
      );

      return res.end();
    }

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
