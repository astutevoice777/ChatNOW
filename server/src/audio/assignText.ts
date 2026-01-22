export function assignTextToSpeakers(
  fullText: string,
  turns: { speaker: string; start: number; end: number }[]
) {
  const words = fullText.split(/\s+/);
  const totalDuration = turns.reduce(
    (sum, t) => sum + (t.end - t.start),
    0
  );

  let wordIndex = 0;
  const result = [];

  for (const turn of turns) {
    const durationRatio = (turn.end - turn.start) / totalDuration;
    const wordCount = Math.max(1, Math.round(words.length * durationRatio));

    const chunk = words.slice(wordIndex, wordIndex + wordCount).join(" ");
    wordIndex += wordCount;

    result.push({
      speaker: turn.speaker,
      text: chunk
    });
  }

  return result;
}
