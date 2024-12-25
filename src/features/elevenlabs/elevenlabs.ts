import axios from "axios";

// Sends a message to the server-side API to synthesize speech.
export async function synthesizeVoice(message: string) {
  try {
    const response = await axios.post("https://fuzzfren.xyz/api/synthesizeVoice", { message });
    // Directly return the base64 string instead of wrapping it in an 'audio' field
    return response.data.audio;
  } catch (error) {
    console.error("Error synthesizing voice:", error);
    throw error;
  }
}

// Fetches available voices from the server-side API.
export async function getVoices() {
  try {
    const response = await axios.get("https://fuzzfren.xyz/api/getVoices");
    return response.data;
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}