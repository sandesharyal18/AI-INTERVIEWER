import OpenAI from "openai";
import { QUESTIONS_PROMPT } from "../services/contant.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Details } from "../models/details.model.js";

const generateQuestions = async (req, res) => {

  try {
    console.log(process.env.OPENROUTER_API_KEY)
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Unauthorized"));
    }

    const { jobposition, jobdescription, duration, type } = req.body;

    // Validate required fields
    if (!jobposition || !jobdescription || !duration || !type) {
      throw new ApiError(400, "All fields are required");
    }

    let FINAL_PROMPT = QUESTIONS_PROMPT
      .replace(/{{jobTitle}}/g, jobposition)
      .replace(/{{jobDescription}}/g, jobdescription)
      .replace(/{{duration}}/g, duration)
      .replace(/{{type}}/g, type);

    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-v3.2",
      messages: [
        {
          role: "user",
          content: FINAL_PROMPT,
        },
      ],
      reasoning: {
        enabled: true, // DeepSeek V3.2 reasoning control
      },
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0].message.content;

    let questions;
    try {
      questions = JSON.parse(responseContent);
    } catch (error) {
      throw new ApiError(500, "Invalid JSON response from AI");
    }

    const detail = await Details.create({
      jobposition,
      jobdescription,
      duration,
      type,
      email: user.email,
      question: questions,
      user: user._id,
    });

    if (!detail) {
      throw new ApiError(500, "Failed to create interview details");
    }

    res.status(200).json({
      message: completion.choices[0].message,
      detailsId: detail._id,
    });
  } catch (error) {
    console.error(error);

    const statusCode = error.statusCode || 500;

    res.status(statusCode).json(
      new ApiResponse(
        statusCode,
        null,
        error.message || "Failed to generate questions"
      )
    );
  }
};

const getUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res
      .status(401)
      .json(new ApiResponse(401, null, "Unauthorized"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User retrieved successfully"));
});

export { generateQuestions, getUser };
