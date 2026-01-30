import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { transcribeWithSarvam } from "../audio/sarvam";
import { detectSilences } from "../audio/silence";
import { buildSpeakerTurns } from "../audio/diarize";
import { assignTextToSpeakers } from "../audio/assignText";
import { translateDiarizedTranscript } from "../audio/translateDiarized";
import { summary } from "../audio/minutes";
import { embedText } from "../embeddings";
import { db } from "../db";

const router = express.Router();

/* ---------- Upload setup ---------- */

const rawDir = path.join(process.cwd(), "uploads", "raw");
if (!fs.existsSync(rawDir)) {
  fs.mkdirSync(rawDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: rawDir,
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const allowed = [
      "audio/mp3",
      "audio/mpeg",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Unsupported audio format"));
    }
    cb(null, true);
  },
});

/* ---------- Route ---------- */

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  let rawPath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    rawPath = req.file.path;

    /* 1️⃣ Detect pauses */
    const { silences, duration } = await detectSilences(rawPath);

    /* 2️⃣ Transcribe (mixed language) */
    const transcript = await transcribeWithSarvam(rawPath);

    const text =
      typeof transcript === "string"
        ? transcript
        : transcript.text ?? "";

    /* 3️⃣ Speaker turns */
    const turns = buildSpeakerTurns(silences, duration);

    /* 4️⃣ Assign text */
    const diarized = assignTextToSpeakers(text, turns);

    /* 5️⃣ Translate to English */
    const translated = await translateDiarizedTranscript(diarized);

    const meeting_summary = await summary(diarized);

    /* 6️⃣ Embed & Store */
    console.log("Generating embedding for summary...");
    const vector = await embedText(meeting_summary);

    const meetingId = `meeting-${Date.now()}`;
    const pressedAt = req.body.pressedAt
    ? new Date(Number(req.body.pressedAt))
    : new Date();
    console.log(pressedAt);

    await db.query(
        "INSERT INTO meeting_minutes (meeting_id, minutes, embedding, created_at) VALUES ($1, $2, $3, $4)",
        [meetingId, meeting_summary, `[${vector.join(",")}]`, pressedAt]
    );
    console.log("Stored meeting minutes and embedding for", meetingId);
    console.log(pressedAt);

    return res.json({
      transcript: translated, 
      mom : meeting_summary
    });

  } catch (err) {
    console.error("DIARIZATION ERROR:", err);
    return res.status(500).json({ error: "Transcription failed" });
  } finally {
    if (rawPath && fs.existsSync(rawPath)) {
      fs.unlinkSync(rawPath);
    }
  }
});

export default router;
