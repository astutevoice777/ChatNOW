import axios from "axios";
import FormData from "form-data";
import fs from "fs";

const SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text";

export async function transcribeWithSarvam(filePath: string) {
  const formData = new FormData();

  formData.append("file", fs.createReadStream(filePath));
  formData.append("language_code", "en-IN"); // or hi-IN, ta-IN, etc.

  const response = await axios.post(SARVAM_STT_URL, formData, {
    headers: {
      ...formData.getHeaders(),
      "Authorization": `Bearer ${process.env.SARVAM_API_KEY}`,
    },
  });

  return response.data;
}
