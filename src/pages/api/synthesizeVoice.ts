import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig, ResponseType } from "axios";

const VOICE_ID = "X4gTNLQeed3vMoHjKW48";
const API_KEY = process.env.ELEVENLABS_API_KEY; // Securely fetch API key from environment variables.

if (!API_KEY) {
  throw new Error("ELEVENLABS_API_KEY is not set in environment variables");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://0xbunny.wtf"); // Allows all origins, replace '*' with specific domains if needed
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allow specific methods
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

  // Handle OPTIONS method (pre-flight request)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "A valid 'message' field is required" });
  }

  try {
    const options: AxiosRequestConfig = {
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: "audio/mpeg",
        "content-type": "application/json",
        "xi-api-key": API_KEY,
      },
      data: {
        text: message,
      },
      responseType: "arraybuffer" as ResponseType, // Explicitly cast as ResponseType
    };

    const response = await axios.request(options);
    const audioData = response.data;

    // Convert binary audio data to Base64
    const base64Audio = Buffer.from(audioData).toString("base64");

    res.status(200).json({ audio: base64Audio });
  } catch (error) {
    console.error("Error synthesizing voice:", error);

    const errorMessage =
      axios.isAxiosError(error) && error.response
        ? `API Error: ${error.response.status} - ${error.response.data}`
        : "An unexpected error occurred";

    res.status(500).json({ error: errorMessage });
  }
}