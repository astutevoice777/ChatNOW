// Bun / Node 18+ native fetch
const apiKey = process.env.SARVAM_API_KEY;
if (!apiKey) throw new Error("SARVAM_API_KEY is missing");

export async function translateToEnglish(text: string): Promise<string> {
  if (!text?.trim()) return "";

  try {
    // We use the OpenAI-compatible endpoint provided by Sarvam
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Sarvam's v1 chat endpoint typically uses Bearer auth (OpenAI standard)
        // or sometimes 'api-subscription-key'. Standardizing on Bearer for the v1 endpoint:
        "Authorization": `Bearer ${apiKey}`, 
      },
      body: JSON.stringify({
        model: "sarvam-m", // This is their specialized Indic LLM
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Your task is to transcribe and translate the following mixed-language speech (Hindi, Tamil, English) into clear, natural English. Capture the meaning and tone, rather than a strict word-for-word translation."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more accurate/less creative translations
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam LLM Error: ${response.status} - ${err}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content?.trim() || text;

  } catch (error) {
    console.error("LLM Transcription error:", error);
    return text;
  }
}