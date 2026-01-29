import axios from "axios";
import { API_BASE_URL } from "../config";

export async function sendRecording(blob: Blob) {
  const formData = new FormData();

  formData.append("audio", blob, "recording.webm");

  const res = await axios.post(
    `${API_BASE_URL}/transcribe`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
}
