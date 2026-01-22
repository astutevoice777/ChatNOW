import axios from "axios";

export async function sendRecording(blob: Blob) {
  const formData = new FormData();

  formData.append("audio", blob, "recording.webm");

  const res = await axios.post(
    "http://localhost:3003/transcribe",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
}
