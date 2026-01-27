import { useRef, useState } from "react";

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);

  async function startRecording() {
    try {
      console.log("Starting recording...");
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

      console.log("Stream obtained:", stream.id, "Tracks:", stream.getTracks().length);
      streamRef.current = stream;

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

      // Initial onstop to handle system-initiated stops (e.g. "Stop sharing" button)
      recorder.onstop = () => {
         console.log("Recorder stopped (system/default handler).");
         stream.getTracks().forEach(t => t.stop());
         audioStream.getTracks().forEach(t => t.stop());
         // Ensure state is updated if stopped externally
         setRecording(false);
      };

      recorder.start();
      console.log("MediaRecorder started. State:", recorder.state);
      mediaRecorderRef.current = recorder;
      setRecording(true);

    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  }

  async function stopRecording(): Promise<Blob> {
    console.log("stopRecording called");
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      
      if (!recorder) {
        console.warn("No mediaRecorderRef.current found in stopRecording");
        resolve(new Blob([], { type: "audio/webm" }));
        return;
      }

      console.log("Current recorder state:", recorder.state);

      const cleanupAndResolve = () => {
        console.log("Performing cleanup...");
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm"
        });
        
        // Stop all tracks from the original stream (including video/screen)
        if (streamRef.current) {
            console.log("Stopping stream tracks:", streamRef.current.getTracks().length);
            streamRef.current.getTracks().forEach(track => {
                console.log("Stopping track:", track.kind, track.label);
                track.stop();
            });
            streamRef.current = null;
        } else {
            console.log("No streamRef to clean up!");
        }

        setRecording(false);
        console.log("Resolving stopRecording promise");
        resolve(blob);
      };

      if (recorder.state === "inactive") {
          console.log("Recorder is already inactive. Running cleanup manually.");
          cleanupAndResolve();
      } else {
          // Flatten the onstop handler to ensure we capture the blob
          recorder.onstop = () => {
              console.log("onstop event fired.");
              cleanupAndResolve();
          };
          recorder.stop();
          console.log("recorder.stop() called");
      }
    });
  }

  return {
    startRecording,
    stopRecording,
    recording
  };
}
