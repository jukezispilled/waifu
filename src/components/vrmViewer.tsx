import { useContext, useCallback } from "react";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "@/utils/buildUrl";

export default function VrmViewer() {
  const { viewer } = useContext(ViewerContext);

  const AVATAR_SAMPLE_B_VRM_URL =
    "https://uy65dxy0a1v9lyum.public.blob.vercel-storage.com/3151472595505291633-jOImpfmcnoOtWlRYo4NHyKyJS9TPQZ.vrm";

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        viewer.loadVrm(buildUrl(AVATAR_SAMPLE_B_VRM_URL));

        // Drag and DropでVRMを差し替え
        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
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
    <div className={"absolute bottom-0 left-0 w-screen h-[100svh] -z-10"}>
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-20 opacity-0"
      >
        <source src="/glitch.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute top-[10px] right-[10px]">
      <div style={{
        backgroundColor: 'white', 
        padding: '0.5rem', 
        borderRadius: '9999px', 
        fontWeight: 'bold'
      }}>
        <span>
          <a href="https://x.com/bunnygirl0x">
            @bunnygirl0x
          </a>
        </span>
      </div>

      </div>

      {/* 3D Canvas */}
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>

      {/* Overlay Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover opacity-0 pointer-events-none z-10"
      >
        <source src="/glitch.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}