import React, { useEffect, useState } from "react";

function AudioPlayer({ text, numeric, lang, onEnd }) {
  const [audioSrc, setAudioSrc] = useState("");
  const [audioElement, setAudioElement] = useState(null);
  const [restart, setRestart] = useState(false); // New state for restart action

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
      const audio = new Audio(audioSrc);
      audio.addEventListener("ended", handleAudioEnd);
      setAudioElement(audio);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      return () => {
        audio.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, [audioSrc, restart]); // Listen for changes in restart state

  const handleAudioEnd = () => {
    if (typeof onEnd === "function") {
      onEnd();
    }
  };

  const handlePause = () => {
    if (audioElement) {
      audioElement.pause();
    }
  };

  const handleContinue = () => {
    if (audioElement) {
      audioElement.play();
    }
  };

  const handleRestart = () => {
    if (audioElement) {
      const audio = new Audio(audioSrc);
      audio.addEventListener("ended", handleAudioEnd);
      setAudioElement(audio); // Reset audio to the beginning
      audioElement.play(); // Start playing again
      setRestart(!restart); // Toggle restart state
    }
  };

  return (
    <div>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleContinue}>Continue</button>
      <button onClick={handleRestart}>Restart</button> {/* Restart button */}
    </div>
  );
}

export default AudioPlayer;
