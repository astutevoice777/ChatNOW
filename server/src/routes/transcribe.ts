import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { normalizeAudio } from "../audio/ffmpeg";
import { transcribeWithGoogle } from "../audio/sarvam";

const router = express.Router();

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

const upload = multer({ storage });

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  let rawPath: string | null = null;
  let wavPath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    rawPath = req.file.path;

    // 🔥 Convert to Google-safe WAV
    wavPath = await normalizeAudio(rawPath);

    const text = await transcribeWithGoogle(wavPath);

    res.json({ text });
  } catch (err) {
    console.error("TRANSCRIPTION ERROR:", err);
    res.status(500).json({ error: "Transcription failed" });
  } finally {
    // 🧹 Cleanup
    if (rawPath && fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
    if (wavPath && fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
  }
});

export default router;
