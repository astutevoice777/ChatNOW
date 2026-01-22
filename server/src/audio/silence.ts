import { spawn } from "child_process";

export interface SilenceSegment {
  start: number;
  end: number;
}

export async function detectSilences(
  filePath: string
): Promise<{ silences: SilenceSegment[]; duration: number }> {
  return new Promise((resolve, reject) => {
    const silences: SilenceSegment[] = [];
    let currentSilenceStart: number | null = null;
    let duration = 0;

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      filePath,
      "-af",
      "silencedetect=noise=-30dB:d=0.8",
      "-f",
      "null",
      "-"
    ]);

    ffmpeg.stderr.on("data", (data) => {
      const text = data.toString();

      // Detect silence start
      const startMatch = text.match(/silence_start: ([0-9.]+)/);
      if (startMatch) {
        currentSilenceStart = parseFloat(startMatch[1]);
      }

      // Detect silence end
      const endMatch = text.match(/silence_end: ([0-9.]+)/);
      if (endMatch && currentSilenceStart !== null) {
        silences.push({
          start: currentSilenceStart,
          end: parseFloat(endMatch[1])
        });
        currentSilenceStart = null;
      }

      // Extract duration
      const durationMatch = text.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
      if (durationMatch) {
        const h = Number(durationMatch[1]);
        const m = Number(durationMatch[2]);
        const s = Number(durationMatch[3]);
        duration = h * 3600 + m * 60 + s;
      }
    });

    ffmpeg.on("close", () => {
      resolve({ silences, duration });
    });

    ffmpeg.on("error", reject);
  });
}
