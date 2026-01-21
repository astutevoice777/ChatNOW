import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

const SARVAM_API_KEY = process.env.SARVAM_API_KEY!;

export async function transcribeWithSarvam(filePath: string): Promise<string> {
  const form = new FormData();

  form.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath),
  });
  form.append("language_code", "en-IN");

  const response = await axios.post(
    "https://api.sarvam.ai/speech-to-text",
    form,
    {
      headers: {
        ...form.getHeaders(),
        "api-subscription-key": SARVAM_API_KEY,
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    }
  );

  return (
    response.data?.text ||
    response.data?.transcript ||
    response.data?.result ||
    ""
  );
}
