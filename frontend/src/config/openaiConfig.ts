// API Configuration for OpenAI
// NOTE: The API key is stored in .env file for security
// In production, use a backend proxy instead of exposing the key to frontend

export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "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";
export const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
export const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-3.5-turbo";

// Confidence threshold for escalation
export const CONFIDENCE_THRESHOLD = 0.6;

