import fs from "fs";
import speech, { protos } from "@google-cloud/speech";

const client = new speech.SpeechClient();

export async function transcribeWithGoogle(filePath: string) {
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString("base64");

  const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
    audio: { content: audioBytes },
    config: {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16,
      sampleRateHertz: 16000,
      languageCode: "en-US",
    },
  };

  const [response] = await client.recognize(request);

  const transcription = response.results
    ?.map(r => r.alternatives?.[0]?.transcript)
    .join(" ");

  return transcription || "";
}
