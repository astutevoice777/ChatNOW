import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

export function normalizeAudio(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      process.cwd(),
      "uploads",
      "processed",
      `${Date.now()}.wav`
    );

    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    ffmpeg(inputPath)
      .audioChannels(1)        // mono
      .audioFrequency(16000)   // 16kHz
      .audioCodec("pcm_s16le") // LINEAR16
      .format("wav")
      .on("end", () => resolve(outputPath))
      .on("error", (err) => reject(err))
      .save(outputPath);
  });
}
