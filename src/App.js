import React, { useState, useEffect } from "react";
import Avatar from "./Avatar/Avatar";
import Panaroma from "./Panaroma/Panaroma";
import "./App.css";
import model from "./Avatar/bluedress.glb";
import UrlParam from "./UrlParam";
import Recording from "./Recording";

function App() {
  const modelPath = model;
  const [urlParamCompleted, setUrlParamCompleted] = useState(false);

  // Simulate URL param processing completion with useEffect
  useEffect(() => {
    // Simulated delay for demonstration purposes
    if (urlParamCompleted) {
      console.log("UrlParam Complete its execution");
    }
  }, [urlParamCompleted]);

  return (
    <div className="app-container">
      {/* <Panaroma />
      <div className="avatar-container">
        <Avatar modelPath={modelPath} />
      </div>
      <div className="text-container">
        <UrlParam onExecute={() => setUrlParamCompleted(true)} />
        {urlParamCompleted && <Recording />}
      </div> */}
      <Recording />
    </div>
  );
}

export default App;
