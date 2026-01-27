let recorder;
let data = [];

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.type === 'START_RECORDING') {
        const { streamId } = message;
        try {
            const media = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: streamId
                    }
                },
                video: false // specific to audio
            });

            // Continue playing the audio to the user
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(media);
            source.connect(audioContext.destination);

            recorder = new MediaRecorder(media, { mimeType: 'audio/webm' });
            recorder.ondataavailable = (event) => data.push(event.data);
            recorder.onstop = () => {
                const blob = new Blob(data, { type: 'audio/webm' });
                // We could read the blob as base64 to send it back
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    chrome.runtime.sendMessage({
                        type: 'RECORDING_COMPLETE',
                        data: base64data
                    });
                }
                reader.readAsDataURL(blob);

                // Stop all tracks to release the stream
                media.getTracks().forEach(t => t.stop());
                audioContext.close();
                data = [];
            };
            recorder.start();
        } catch (err) {
            console.error('Error starting recording:', err);
        }
    } else if (message.type === 'STOP_RECORDING') {
        if (recorder) {
            recorder.stop();
        }
    }
});
