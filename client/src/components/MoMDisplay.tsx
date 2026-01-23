interface MoMDisplayProps {
  mom: string;
}

export default function MoMDisplay({ mom }: MoMDisplayProps) {
  if (!mom?.trim()) {
    return (
      <p className="text-center text-gray-500 italic mt-4">
        No MoM generated.
      </p>
    );
  }

  return (
    <div className="bg-gray-50 border rounded-xl p-4 shadow-sm max-h-96 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
      {mom}
    </div>
  );
}
