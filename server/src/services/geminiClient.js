import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let ai = null;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" && !process.env.GEMINI_API_KEY.includes("YourActualGeminiKey")) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } catch (err) {
    console.warn("Warning initializing GoogleGenAI client:", err.message);
  }
} else {
  console.warn("GEMINI_API_KEY environment variable is not configured with a live key. AI fallback generator will simulate high-fidelity industrial intelligence.");
}

export default ai;
