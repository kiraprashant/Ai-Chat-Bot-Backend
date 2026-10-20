
import { ChatOllama } from "@langchain/ollama";
import UserModel from "../../Models/UserModel.js";

 

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




const model = new ChatOllama({
  model: "gemma4:31b-cloud",
  temperature: 0.7,
});

const GenAI = async(req,res) => {

  try {
    console.log("working")
    const response = await model.invoke([
      {
        role: "system",
        content: "You are a helpful AI assistant also help me in Explain concepts simply and provide code examples.",
      },
      {
        role: "user",
        content: "Tell me about Server and client programing which top 3 best tech",
      },
    ]);
  
    // console.log(response.usage_metadata);
    // console.log(response.content);

    res.json({
      msg: "Login successful",
      content: response.content,
      usage:response.usage_metadata
    });
  }
  catch(e){
    console.log(e)
  }

}

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
