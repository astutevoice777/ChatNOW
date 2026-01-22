import { useRecorder } from "../hooks/useRecorder";
import { sendRecording } from "../api/transcribe";
import { useState } from "react";

export default function Recorder() {
  const { startRecording, stopRecording, recording } = useRecorder();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStop() {
    try {
      setLoading(true);
      setError(null);

      const blob = await stopRecording();
      const res = await sendRecording(blob);

      setResult(res);
    } catch (err) {
      setError("Transcription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-6 rounded-2xl shadow-lg bg-white border">
      {/* Title */}
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Audio Recorder
      </h2>

      {/* Status */}
      <p className="text-sm text-gray-500 text-center mt-1">
        {recording
          ? "Recording in progress…"
          : loading
          ? "Processing audio…"
          : "Click to start recording"}
      </p>

      {/* Record Button */}
      <div className="flex justify-center mt-8">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-2xl flex items-center justify-center transition"
          >
            🎙️
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl flex items-center justify-center animate-pulse transition"
          >
            ⏹️
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-sm text-blue-600 mt-6">
          Transcribing and diarizing audio…
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-center text-sm text-red-600 mt-4">
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Transcription Output
          </h3>

          <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
