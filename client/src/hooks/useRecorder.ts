import { useRef, useState } from "react";

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream, {
      mimeType: "audio/webm"
    });

    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }

  async function stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm"
        });
        setRecording(false);
        resolve(blob);
      };

      mediaRecorderRef.current.stop();
    });
  }

  return {
    startRecording,
    stopRecording,
    recording
  };
}
