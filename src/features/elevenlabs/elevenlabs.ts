import axios from "axios";

// Sends a message to the server-side API to synthesize speech.
export async function synthesizeVoice(message: string) {
  try {
    const response = await axios.post("/api/synthesizeVoice", { message });
    const audioBase64 = response.data.audio;
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;
    return audioUrl;
  } catch (error) {
    console.error("Error synthesizing voice:", error);
    throw error;
  }
}

// Fetches available voices from the server-side API.
export async function getVoices() {
  try {
    const response = await axios.get("/api/getVoices");
    return response.data;
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}