import { useMemo } from 'react';

export type TranscriptSegment = {
    speaker: string;
    text: string;
};

interface TranscriptDisplayProps {
    transcript: TranscriptSegment[];
}

const speakerColors = [
    'bg-blue-50 border-blue-100 text-blue-900',
    'bg-emerald-50 border-emerald-100 text-emerald-900',
    'bg-violet-50 border-violet-100 text-violet-900',
    'bg-amber-50 border-amber-100 text-amber-900',
    'bg-rose-50 border-rose-100 text-rose-900',
];

export default function TranscriptDisplay({ transcript }: TranscriptDisplayProps) {
    // Map speakers to specific indices to ensure consistent coloring
    const speakerColorMap = useMemo(() => {
        if (!transcript) return new Map();
        const uniqueSpeakers = Array.from(new Set(transcript.map(t => t.speaker))).sort();
        const map = new Map<string, string>();
        uniqueSpeakers.forEach((speaker, index) => {
            map.set(speaker, speakerColors[index % speakerColors.length]);
        });
        return map;
    }, [transcript]);

    if (!transcript || transcript.length === 0) {
        return <p className="text-center text-gray-500 italic mt-4">No content to display.</p>;
    }

    return (
        <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar p-2">
            {transcript.map((segment, index) => {
                const colorClass = speakerColorMap.get(segment.speaker) || speakerColors[0];

                return (
                    <div key={index} className="flex flex-col items-start transition-all duration-300 ease-in-out">
                        <span className="text-xs font-semibold text-gray-400 uppercase ml-2 mb-1 tracking-wide">
                            {segment.speaker.replace('_', ' ')}
                        </span>
                        <div className={`rounded-2xl rounded-tl-none p-3 shadow-sm border ${colorClass} max-w-[90%]`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{segment.text}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
