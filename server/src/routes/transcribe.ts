import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { transcribeWithWhisper } from "../whisper";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post(
  "/transcribe",
  upload.single("audio"),
  async (req, res) => {
    try {
      const filePath = req.file!.path;

      const text = await transcribeWithWhisper(filePath);

      fs.unlinkSync(filePath); // 🧹 delete temp file

      res.json({ text });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Transcription failed" });
    }
  }
);

export default router;
