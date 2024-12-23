// pages/api/getVoices.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_KEY = process.env.ELEVENLABS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: {
        "xi-api-key": API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching voices:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
}
