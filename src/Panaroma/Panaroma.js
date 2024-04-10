import React, { useEffect } from "react";
import * as PANOLENS from "panolens";

function Panaroma() {
  useEffect(() => {
    const panorama = new PANOLENS.CubePanorama([
      "./Panorama/px.jpg",
      "./Panorama/nx.jpg",
      "./Panorama/py.jpg",
      "./Panorama/ny.jpg",
      "./Panorama/pz.jpg",
      "./Panorama/nz.jpg",
    ]);

    const viewerInstance = new PANOLENS.Viewer({
      output: "console",
      container: document.querySelector("#panoramaContainer"),
    });
    viewerInstance.setCameraFov(85);
    viewerInstance.add(panorama);
  }, []);

  return (
    <div
      id="panoramaContainer"
      style={{ width: "100%", height: "100vh" }}
    ></div>
  );
}

export default Panaroma;
