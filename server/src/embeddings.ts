import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export async function embedText(text: string): Promise<number[]> {
  const result = await model.embedContent(text);

  const embedding = result.embedding.values;

  if (embedding.length !== 768) {
    throw new Error("Invalid embedding dimension");
  }

  return embedding;
}
