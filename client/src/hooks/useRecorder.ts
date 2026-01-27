import { useRef, useState } from "react";

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);

  async function startRecording() {
    try {
      // 1. Get Stream ID from background
      const response = await chrome.runtime.sendMessage({ type: 'GET_STREAM_ID' });
      
      if (!response || !response.streamId) {
        throw new Error("Failed to get stream ID or user cancelled");
      }

      // 2. Get Media Stream using the ID
      // Note: chromeMediaSource 'desktop' requires video constraint to be present, even if we only want audio.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: response.streamId
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: response.streamId
          }
        }
      } as any); // Type assertion needed for mandatory constraints

      // 3. Extract Audio Track Only (we don't want video in the blob)
      const audioTrack = stream.getAudioTracks()[0];
      const audioStream = new MediaStream([audioTrack]);

      // 4. Start Recording locally
      const recorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm"
      });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
         // Stop the stream tracks when recording stops
         stream.getTracks().forEach(t => t.stop());
         audioStream.getTracks().forEach(t => t.stop()); 
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);

    } catch (err) {
      console.error("Failed to start recording:", err);
    }
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
