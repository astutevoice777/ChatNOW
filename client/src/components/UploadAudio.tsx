import { useState } from "react";
import axios from "axios";

export default function UploadAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");

  async function handleUpload() {
    if (!file) return;

    const formData = new FormData();
    formData.append("audio", file);

    const res = await axios.post(
      "http://localhost:3003/transcribe",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setTranscript(res.data.text);
  }

  return (
    <div>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload}>Upload & Transcribe</button>

      {transcript && (
        <pre style={{ marginTop: 20 }}>{transcript}</pre>
      )}
    </div>
  );
}
