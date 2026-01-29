import { useRecorder } from "../hooks/useRecorder";
import { sendRecording } from "../api/transcribe";
import { useState } from "react";
import TranscriptDisplay from "./TranscriptDisplay";
import MoMDisplay from "./MoMDisplay";
import axios from "axios";

export default function Recorder() {
  const { startRecording, stopRecording, recording } = useRecorder();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);


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

  async function handleSemanticSearch() {
  if (!searchQuery.trim()) return;

  try {
    setSearchLoading(true);
    setError(null);

    const res = await axios.post(
      "http://localhost:3003/semantic-search",
      { query: searchQuery }
    );

    setSearchResults(res.data.results); // ✅ axios way
  } catch (err) {
    console.error(err);
    setError("Semantic search failed.");
  } finally {
    setSearchLoading(false);
  }
}



  return (
  <div className="max-w-xl mx-auto mt-16 p-6 rounded-2xl shadow-lg bg-white border">
    <h2 className="text-xl font-semibold text-gray-800 text-center">
      ChatNOW
    </h2>

    <p className="text-sm text-gray-500 text-center mt-1">
      {recording
        ? "Recording in progress…"
        : loading
        ? "Processing audio…"
        : "Click to start recording"}
    </p>

    <div className="flex justify-center mt-8">
      {!recording ? (
        <button
          onClick={startRecording}
          disabled={loading}
          className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-2xl flex items-center justify-center"
        >
          🎙️
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white text-2xl flex items-center justify-center animate-pulse"
        >
          ⏹️
        </button>
      )}
    </div>

    {loading && (
      <p className="text-center text-sm text-blue-600 mt-6">
        Transcribing and diarizing audio…
      </p>
    )}

    {error && (
      <p className="text-center text-sm text-red-600 mt-4">{error}</p>
    )}

    {result && (
      <>
        {/* Transcript */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Transcription Output
          </h3>
          <TranscriptDisplay transcript={result.transcript} />
        </div>

        {/* MoM */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Minutes of the Meeting
          </h3>
          <MoMDisplay mom={result.mom} />
        </div>

        {/* Semantic Search */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Semantic Search
          </h3>

          <div className="flex gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask something about past meetings..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              onClick={handleSemanticSearch}
              disabled={searchLoading}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg disabled:opacity-50"
            >
              {searchLoading ? "Searching…" : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              {searchResults.map((r, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg bg-gray-50 text-sm"
                >
                  <p className="text-xs text-gray-500 mb-1">
                    Meeting: {r.meeting_id}
                  </p>
                  <p className="whitespace-pre-wrap">{r.minutes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )}
  </div>
);
}
