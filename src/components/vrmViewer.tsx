import React, { useContext, useCallback } from "react";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { TextField, Button, Window, WindowContent, Panel } from 'react95';
import original from "react95/dist/themes/original";

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #008080;
  }
`;

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);

  const AVATAR_SAMPLE_B_VRM_URL =
    "agi.vrm";

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        viewer.loadVrm(buildUrl(AVATAR_SAMPLE_B_VRM_URL));

        // Drag and Drop VRM replacement
        canvas.addEventListener("dragover", (event) => event.preventDefault());
        canvas.addEventListener("drop", (event) => {
          event.preventDefault();
          const files = event.dataTransfer?.files;
          if (!files) return;

          const file = files[0];
          if (file?.name.endsWith(".vrm")) {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            viewer.loadVrm(url);
          }
        });
      }
    },
    [viewer]
  );

  return (
    <div>
      <GlobalStyles />
      <div className="bg-[#0F0F0F]" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100vh", zIndex: -10 }}>

        {/* 3D Canvas */}
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }}></canvas>
      </div>
    </div>
  );
}