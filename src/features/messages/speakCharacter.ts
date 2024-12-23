import { wait } from "@/utils/wait";
import { synthesizeVoice } from "../elevenlabs/elevenlabs";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Talk } from "./messages";
import { ElevenLabsParam } from "../constants/elevenLabsParam";

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
    onStart?: Callback, // Type onStart as an optional callback
    onComplete?: Callback // Type onComplete as an optional callback
  ) => {
    const fetchPromise = prevFetchPromise.then(async () => {
      const now = Date.now();
      if (now - lastTime < 1000) {
        await wait(1000 - (now - lastTime));
      }

      const buffer = await fetchAudio(screenplay.talk, elevenLabsKey, elevenLabsParam).catch(() => null);
      lastTime = Date.now();
      return buffer;
    });

    prevFetchPromise = fetchPromise;
    prevSpeakPromise = Promise.all([fetchPromise, prevSpeakPromise]).then(([audioBuffer]) => {
      onStart?.(); // Safe to call onStart now since it's typed as a function
      if (!audioBuffer) {
        // Pass along screenplay to change avatar expression
        return viewer.model?.speak(null, screenplay);
      }
      return viewer.model?.speak(audioBuffer, screenplay);
    });

    prevSpeakPromise.then(() => {
      onComplete?.(); // Safe to call onComplete
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
    // Ensure synthesizeVoice returns a structured response
    const ttsResponse = await synthesizeVoice(talk.message);

    if (typeof ttsResponse !== "object" || !ttsResponse.audio) {
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