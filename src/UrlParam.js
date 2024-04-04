import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import jsonData from "./data.json";
import AudioPlayer from "./AudioPlayer";

const decryptionAES = (decryptStr) => {
  // Decrypt
  const bytes = CryptoJS.AES.decrypt(decryptStr, "1234567890123456");
  const plaintext = bytes.toString(CryptoJS.enc.Utf8);
  return plaintext;
};

const combineData = (params, jsonData) => {
  const excludedParams = ["clanguage", "applicant_id", "user_id"]; // List of excluded parameters
  let combinedText = "";

  // Combine URL parameters with JSON data, excluding excluded parameters
  Object.keys(params).forEach((key, index) => {
    if (!excludedParams.includes(key)) {
      const paramValue = params[key] ? params[key] : ""; // If parameter exists, use it, otherwise use an empty string
      combinedText += `${jsonData[index]}${paramValue}.`; // Concatenate JSON data with parameter value and dot
    }
  });

  return combinedText;
};

const UrlParam = () => {
  const [sentences, setSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const [audioStarted, setAudioStarted] = useState(false); // Define audioStarted state

  useEffect(() => {
    console.log("Fetching data...");
    const urlParams = new URLSearchParams(window.location.search);
    const encodedEncryptedURLParam = urlParams.get("data");

    if (encodedEncryptedURLParam) {
      console.log("Decoding and decrypting data...");
      let newString = encodedEncryptedURLParam.replaceAll(" ", "+");
      const encryptedURLParam = decodeURIComponent(newString);
      const decryptedURL = decryptionAES(encryptedURLParam);
      const decryptedParams = Object.fromEntries(
        new URLSearchParams(decryptedURL)
      );
      console.log("URL Parameters:", decryptedParams);
      const language = decryptedParams["clanguage"] || "english"; // default to English if language not specified
      const langData =
        language === "english"
          ? jsonData.language[0].english.data
          : jsonData.language[0].hindi.data;

      if (langData) {
        console.log("Combining data...");
        const combined = combineData(decryptedParams, langData);
        const lastSentence = langData[langData.length - 1]; // Get the last sentence from data.json
        const combinedWithLastSentence = combined + lastSentence; // Append the last sentence to combined text
        const splitSentences = combinedWithLastSentence
          .split(".")
          .filter((sentence) => sentence.trim() !== ""); // Filter out empty strings
        console.log("Split Sentences:", splitSentences); // Log split sentences to console
        setSentences(splitSentences);
        setLoading(false); // Update loading state to false after processing data
        console.log("Total Sentences:", splitSentences.length); // Log total sentences to console

        // Check if specified parameters are present
        const {
          accountNumber,
          LoanID,
          Centermangcontactno,
          Branchmgrcontactno,
        } = decryptedParams;
        if (
          accountNumber &&
          LoanID &&
          Centermangcontactno &&
          Branchmgrcontactno
        ) {
          const combinedParams = [
            accountNumber,
            LoanID,
            Centermangcontactno,
            Branchmgrcontactno,
          ]
            .toString()
            .split("")
            .join(" ");
          console.log("Combined Parameters:", combinedParams);
        }
      } else {
        console.error("Invalid language specified or language not supported.");
      }
    } else {
      console.error("No 'data' parameter found in the URL query string.");
    }
  }, []);

  const handleSentenceChange = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex((prevIndex) => prevIndex + 1);
    }
  };

  if (loading) {
    return <div>Loading..</div>; // Render loading state
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
