interface SpeakerTurn {
  speaker: string;
  start: number;
  end: number;
}

export function buildSpeakerTurns(
  silences: { start: number; end: number }[],
  duration: number
): SpeakerTurn[] {
  const turns: SpeakerTurn[] = [];
  let currentStart = 0;
  let speakerIndex = 0;

  for (const silence of silences) {
    if (silence.start > currentStart) {
      turns.push({
        speaker: `Speaker ${speakerIndex % 2 === 0 ? 1 : 2}`,
        start: currentStart,
        end: silence.start
      });
      speakerIndex++;
    }
    currentStart = silence.end;
  }

  // Final turn
  if (currentStart < duration) {
    turns.push({
      speaker: `Speaker ${speakerIndex % 2 === 0 ? 1 : 2}`,
      start: currentStart,
      end: duration
    });
  }

  return turns;
}
