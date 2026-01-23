// Bun / Node 18+ native fetch

type DiarizedSegment = {
  speaker: string;
  text: string;
};

const apiKey = process.env.SARVAM_API_KEY;
if (!apiKey) throw new Error("SARVAM_API_KEY is missing");

function formatDiarizedTranscript(segments: DiarizedSegment[]): string {
  return segments
    .filter(s => s.text?.trim())
    .map(s => `${s.speaker}: ${s.text.trim()}`)
    .join("\n");
}

export async function summary(
  segments: DiarizedSegment[]
): Promise<string> {
  if (!segments || segments.length === 0) return "";

  const transcript = formatDiarizedTranscript(segments);

  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "system",
            content: `
You are an expert meeting assistant.
Generate clear and structured Minutes of Meeting (MoM).
Include:
- Key discussion points
- Decisions made
- Action items with owners (if identifiable)
- Important follow-ups
Make it in english.
`
          },
          {
            role: "user",
            content: transcript
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Sarvam LLM Error: ${response.status} - ${err}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content?.trim() || "";

  } catch (error) {
    console.error("LLM Summary error:", error);
    return "";
  }
}
