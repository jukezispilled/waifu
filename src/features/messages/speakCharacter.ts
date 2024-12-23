import { wait } from "@/utils/wait";
import { synthesizeVoice } from "../elevenlabs/elevenlabs";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";
import { ElevenLabsParam } from "../constants/elevenLabsParam";

// Define the expected response type from synthesizeVoice
interface TTSResponse {
  audio: string;  // URL or base64 string of the audio
}

interface Callback {
  (): void;
}

const createSpeakCharacter = () => {
  let lastTime = 0;
  let prevFetchPromise: Promise<unknown> = Promise.resolve();
  let prevSpeakPromise: Promise<unknown> = Promise.resolve();

  return (
    screenplay: Screenplay,
    elevenLabsKey: string,
    elevenLabsParam: ElevenLabsParam,
    viewer: Viewer,
    onStart?: Callback,
    onComplete?: Callback
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }
      const buffer = await fetchAudio(
        screenplay.talk,
        elevenLabsKey,
        elevenLabsParam
      ).catch(() => null);
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(
      ([audioBuffer]) => {
        onStart?.();
        if (!audioBuffer) {
          return viewer.model?.speak(null, screenplay);
        }
        return viewer.model?.speak(audioBuffer, screenplay);
      }
    );

    prevSpeakPromise.then(() => {
      onComplete?.();
    });
  };
};

export const speakCharacter = createSpeakCharacter();

export const fetchAudio = async (
  talk: Talk,
  elevenLabsKey: string,
  elevenLabsParam: ElevenLabsParam
): Promise<ArrayBuffer> => {
  try {
    const ttsResponse = await synthesizeVoice(talk.message) as unknown as TTSResponse;
    
    if (!ttsResponse || typeof ttsResponse !== "object" || !ttsResponse.audio) {
      throw new Error("Invalid response from synthesizeVoice");
    }

    const audioUrl = ttsResponse.audio;
    const response = await fetch(audioUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error in fetchAudio:", error);
    throw error;
  }
};