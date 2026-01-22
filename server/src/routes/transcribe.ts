import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { transcribeWithSarvam } from "../audio/sarvam";
import { detectSilences } from "../audio/silence";
import { buildSpeakerTurns } from "../audio/diarize";
import { assignTextToSpeakers } from "../audio/assignText";

const router = express.Router();

/**
 * Store raw uploads
 */
const rawDir = path.join(process.cwd(), "uploads", "raw");
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

/**
 * Multer storage
 */
const storage = multer.diskStorage({
  destination: rawDir,
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

/**
 * Optional: restrict audio formats Sarvam supports
 */
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const allowed = [
      "audio/mp3",
      "audio/mpeg", // mp3
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4", // m4a
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported audio format"));
    }
    cb(null, true);
  },
});

/*
let counter = 0;

router.post("/transcribe", upload.single("audio"), async (req, res) => {
   counter++;
  console.log("🔁 HIT COUNT:", counter);
  let rawPath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    rawPath = req.file.path;

    const text = await transcribeWithSarvam(rawPath);

    res.status(200).json({ text });
    return;

  } catch (err) {
    console.error("SARVAM TRANSCRIPTION ERROR:", err);

    if (!res.headersSent) {
      res.status(500).json({ error: "Transcription failed" });
      return;
    }
  }
  finally {
    // 🧹 Cleanup
    if (rawPath && fs.existsSync(rawPath)) {
      fs.unlinkSync(rawPath);
    }
  }
});
*/

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  let rawPath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    rawPath = req.file.path;

    // 1️⃣ Detect pauses
    const { silences, duration } = await detectSilences(rawPath);

    // 2️⃣ Transcribe text
    const transcript = await transcribeWithSarvam(rawPath);

    const text =
      typeof transcript === "string"
        ? transcript
        : transcript.text ?? "";

    // 3️⃣ Build speaker turns
    const turns = buildSpeakerTurns(silences, duration);

    // 4️⃣ Assign text
    const diarized = assignTextToSpeakers(text, turns);

    return res.json({
      transcript: diarized
    });

  } catch (err) {
    console.error("DIARIZATION ERROR:", err);
    return res.status(500).json({ error: "Transcription failed" });
  }
  finally {
    // 🧹 Cleanup
    if (rawPath && fs.existsSync(rawPath)) {
      fs.unlinkSync(rawPath);
    }
  }
});


export default router;
