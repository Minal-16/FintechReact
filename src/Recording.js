import React, { useState, useRef } from "react";
import CryptoJS from "crypto-js"; // Import CryptoJS library
import successAudio from "./Audio/English_Audio.mp3"; // Import success audio file
import failAudio from "./Audio/English_ShrInd.mp3"; // Import fail audio file

const Recording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcript, setTranscript] = useState(""); // State to store the transcript

  // Initialize audio context once and reuse
  const audioContextRef = useRef(
    new (window.AudioContext || window.webkitAudioContext)()
  );

  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      } else if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const resampledAudioBlob = await resampleAndConvertAudio(
        audioBlob,
        16000
      );
      sendAudioForTranscription(resampledAudioBlob);
      setIsRecording(false);
    };
  };

  const resampleAndConvertAudio = async (audioBlob, targetSampleRate) => {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(
      arrayBuffer
    );

    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.duration * targetSampleRate,
      targetSampleRate
    );

    const bufferSource = offlineContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    bufferSource.connect(offlineContext.destination);
    bufferSource.start();

    const renderedBuffer = await offlineContext.startRendering();
    return bufferToBlob(renderedBuffer);
  };

  const sendAudioForTranscription = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio_base64", audioBlob);

      const metadata = {
        ID: "test-1212",
        modelID: "5",
        mode: "dev",
        command: "transcribe",
        userID: "Se343Dd3SDvoqTSd32df34",
      };
      formData.append("metadata", JSON.stringify(metadata));

      const response = await fetch("https://asr-api.vspeech.ai/api/asr/v1", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const transcript = data.alternatives[0].transcript; // Extract the transcript
        console.log("Transcription Response:", transcript);

        // Call the function responsible for sending data to the second API
        handleTranscriptSharing(transcript);
      } else {
        console.error("Request failed with status:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const handleTranscriptSharing = async (transcript) => {
    try {
      const encryptionAES = (encryptStr) => {
        try {
          // Encrypt
          const ciphertext = CryptoJS.AES.encrypt(
            encryptStr,
            "1234567890123456"
          );
          console.log("Encrypted:", ciphertext.toString());
          return ciphertext.toString();
        } catch (error) {
          console.error("Encryption error:", error);
          return null; // or handle the error appropriately
        }
      };

      function encrypt1(input) {
        const stringInput = input.toString(); // Convert input to string
        console.log("Encrypted", encryptionAES(stringInput));
        return encryptionAES(stringInput);
      }

      const applicant_id1 = 1234;
      const user_id1 = 1234;
      console.log(applicant_id1, user_id1, transcript);
      const applicant_id = encrypt1(applicant_id1);
      const user_pin = encrypt1(user_id1);
      const responseText = encrypt1(transcript);
      console.log(applicant_id, user_pin, responseText);
      const requestApiUrl = "https://metawebapp.azurewebsites.net/request";
      const requestPayload = {
        applicant_id: applicant_id,
        user_pin: user_pin,
      };

      const requestResponse = await fetch(requestApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!requestResponse.ok) {
        throw new Error(`HTTP error! Status: ${requestResponse.status}`);
      }

      const requestData = await requestResponse.json();
      const request_id = requestData.request_id;

      const responseApiUrl = "https://metawebapp.azurewebsites.net/response";

      const responsePayload = {
        request_id: request_id,
        applicant_id: applicant_id,
        user_pin: user_pin,
        response: responseText,
      };

      const responseResponse = await fetch(responseApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(responsePayload),
      });

      if (!responseResponse.ok) {
        throw new Error(`HTTP error! Status: ${responseResponse.status}`);
      }

      const responseData = await responseResponse.json();
      console.log("Response API Response:", responseData);

      // Play success audio if API response is successful
      successAudioRef.current.play();
    } catch (error) {
      console.error("Error during API call:", error);

      // Play fail audio if API response fails
      failAudioRef.current.play();
    }
  };

  async function bufferToBlob(audioBuffer) {
    // Function to write the WAV file header
    function writeWAVHeader(
      dataView,
      offset,
      sampleRate,
      channels,
      dataLength
    ) {
      // Helper to write a string to the DataView
      function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }

      writeString(dataView, offset, "RIFF");
      offset += 4; // ChunkID
      dataView.setUint32(offset, 36 + dataLength, true);
      offset += 4; // ChunkSize
      writeString(dataView, offset, "WAVE");
      offset += 4; // Format
      writeString(dataView, offset, "fmt ");
      offset += 4; // Subchunk1ID
      dataView.setUint32(offset, 16, true);
      offset += 4; // Subchunk1Size
      dataView.setUint16(offset, 1, true);
      offset += 2; // AudioFormat (1 is PCM)
      dataView.setUint16(offset, channels, true);
      offset += 2; // NumChannels
      dataView.setUint32(offset, sampleRate, true);
      offset += 4; // SampleRate
      dataView.setUint32(offset, sampleRate * channels * 2, true);
      offset += 4; // ByteRate
      dataView.setUint16(offset, channels * 2, true);
      offset += 2; // BlockAlign
      dataView.setUint16(offset, 16, true);
      offset += 2; // BitsPerSample
      writeString(dataView, offset, "data");
      offset += 4; // Subchunk2ID
      dataView.setUint32(offset, dataLength, true);
      offset += 4; // Subchunk2Size
    }

    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length * numberOfChannels * 2; // 2 bytes per sample
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);

    // Write the WAV container
    writeWAVHeader(view, 0, sampleRate, numberOfChannels, length);

    // Write the PCM data
    let offset = 44; // WAV header size
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const x = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, x < 0 ? x * 0x8000 : x * 0x7fff, true);
        offset += 2;
      }
    }

    // Return as Blob
    return new Blob([view], { type: "audio/wav" });
  }

  // References for audio elements
  const successAudioRef = useRef(null);
  const failAudioRef = useRef(null);

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecordingAndTranscribe} disabled={!isRecording}>
        Stop and Transcribe
      </button>

      {/* Hidden audio elements for playing success and fail sounds */}
      <audio ref={successAudioRef} src={successAudio} />
      <audio ref={failAudioRef} src={failAudio} />
    </div>
  );
};

export default Recording;
