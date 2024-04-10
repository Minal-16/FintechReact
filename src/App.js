import React, { useState } from "react";
import Avatar from "./Avatar/Avatar";
import Panaroma from "./Panaroma/Panaroma";
import "./App.css";
import model from "./Avatar/bluedress.glb";
import UrlParam from "./UrlParam";
import Recording from "./Recording";

function App() {
  const [urlParamCompleted, setUrlParamCompleted] = useState(false);

  return (
    <div className="app-container">
      <Panaroma />
      <div className="avatar-container">
        <Avatar modelPath={model} />
      </div>
      <div className="text-container">
        {!urlParamCompleted ? (
          <UrlParam onComplete={() => setUrlParamCompleted(true)} />
        ) : (
          <Recording />
        )}
      </div>
      {/* <Recording /> */}
    </div>
  );
}

export default App;
