import { translateToEnglish } from "./translate";

type DiarizedSegment = {
  speaker: string;
  text: string;
};

export async function translateDiarizedTranscript(
  diarized: DiarizedSegment[]
): Promise<DiarizedSegment[]> {
  const result: DiarizedSegment[] = [];

  for (const segment of diarized) {
    const english = await translateToEnglish(segment.text);

    result.push({
      speaker: segment.speaker,
      text: english
    });
  }

  return result;
}
