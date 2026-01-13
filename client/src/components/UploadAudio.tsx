import { useState } from "react";
import axios from "axios";

export default function UploadAudio() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;

    setLoading(true);
    setError(null);
    setTranscript("");

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await axios.post(
        "http://localhost:3003/transcribe",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setTranscript(res.data.text);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to transcribe audio"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Audio Transcription</h2>

      <label style={styles.label}>
        Upload audio file
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={styles.input}
        />
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{
          ...styles.button,
          opacity: !file || loading ? 0.6 : 1,
          cursor: !file || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Transcribing..." : "Upload & Transcribe"}
      </button>

      {error && <p style={styles.error}>{error}</p>}

      {transcript && (
        <pre style={styles.transcript}>{transcript}</pre>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 600,
    margin: "40px auto",
    padding: 24,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    fontFamily: "system-ui, sans-serif",
  },
  heading: {
    marginBottom: 16,
    fontSize: 22,
    fontWeight: 600,
  },
  label: {
    display: "block",
    marginBottom: 12,
    fontSize: 14,
    fontWeight: 500,
  },
  input: {
    display: "block",
    marginTop: 8,
  },
  button: {
    marginTop: 12,
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
  },
  error: {
    marginTop: 12,
    color: "#dc2626",
    fontSize: 14,
  },
  transcript: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    whiteSpace: "pre-wrap",
    fontSize: 14,
    lineHeight: 1.5,
  },
};
