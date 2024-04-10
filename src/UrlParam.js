import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import jsonData from "./data.json";
import AudioPlayer from "./AudioPlayer";

const decryptionAES = (decryptStr) => {
  const bytes = CryptoJS.AES.decrypt(decryptStr, "1234567890123456");
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  console.log(plaintext);
  return plaintext;
};

const capitalizeFirstLetter = (name) => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

const combineData = (params, jsonData) => {
  const excludedParams = ["clanguage", "applicant_id", "user_id"];
  let combinedText = "";

  const replaceDigitsWithSpaces = (value) => {
    return String(value).replace(/\d/g, (digit) => digit + " ");
  };

  Object.keys(params).forEach((key, index) => {
    if (!excludedParams.includes(key) && jsonData[index]) {
      let paramValue = params[key] ? params[key] : "";

      // Replace digits with spaces for specific parameters
      if (
        ["accnum", "centermangcontactno", "branchmgrcontactno"].includes(
          key.toLowerCase()
        )
      ) {
        paramValue = replaceDigitsWithSpaces(paramValue);
      }

      // If the key is 'name', normalize the value
      if (key.toLowerCase() === "name") {
        paramValue = capitalizeFirstLetter(paramValue);
      }

      combinedText += `${jsonData[index]}${paramValue}.`;
    }
  });

  return combinedText;
};

const UrlParam = ({ onComplete }) => {
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [allSentencesPlayed, setAllSentencesPlayed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedEncryptedURLParam = urlParams.get("data");

    if (encodedEncryptedURLParam) {
      let newString = encodedEncryptedURLParam.replaceAll(" ", "+");
      const encryptedURLParam = decodeURIComponent(newString);
      const decryptedURL = decryptionAES(encryptedURLParam);
      const decryptedParams = Object.fromEntries(
        new URLSearchParams(decryptedURL)
      );

      const language = decryptedParams["clanguage"] || "english";
      const langData =
        language === "english"
          ? jsonData.language[0].english.data
          : jsonData.language[0].hindi.data;

      if (langData) {
        const combined = combineData(decryptedParams, langData);
        const lastSentence = langData[langData.length - 1];
        const combinedWithLastSentence = combined + lastSentence;
        const splitSentences = combinedWithLastSentence
          .split(".")
          .filter((sentence) => sentence.trim() !== "");

        setSentences(splitSentences);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (allSentencesPlayed) {
      onComplete?.();
    }
  }, [allSentencesPlayed, onComplete]);

  const handleSentenceChange = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prevIndex) => prevIndex + 1);
    } else {
      setAllSentencesPlayed(true);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>{sentences[currentSentenceIndex]}</p>
      {!audioStarted && (
        <button onClick={() => setAudioStarted(true)}>Start Audio</button>
      )}
      {audioStarted && (
        <AudioPlayer
          text={sentences[currentSentenceIndex]}
          numeric="currency"
          lang="hi_female_v1"
          onEnd={handleSentenceChange}
        />
      )}
    </div>
  );
};

export default UrlParam;
