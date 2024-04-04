import React, { useEffect, useState } from "react";

function AudioPlayer({ text, numeric, lang, onEnd }) {
  const [audioSrc, setAudioSrc] = useState("");

  useEffect(() => {
    const api_key = "Grt45rtsd45T332sSw23derAsw2f5sd34i8hsders1";
    const action = "play";
    const samplerate = "8000";
    const ver = "2";
    const encodedText = encodeURIComponent(text);

    const url = `https://tts.indiantts.in/tts?text=${encodedText}&api_key=${api_key}&action=${action}&numeric=${numeric}&lang=${lang}&samplerate=${samplerate}&ver=${ver}`;

    setAudioSrc(url);
  }, [text, numeric, lang]);

  useEffect(() => {
    if (audioSrc) {
      const audioElement = new Audio(audioSrc);
      audioElement.addEventListener("ended", handleAudioEnd);
      audioElement.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      return () => {
        audioElement.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, [audioSrc]);

  const handleAudioEnd = () => {
    if (typeof onEnd === "function") {
      onEnd();
    }
  };

  return null;
}

export default AudioPlayer;
