import { Camera, Send } from "lucide-react";
import { useState } from "react";

type CameraState = "no-permission" | "ask-permission" | "video" | "captured";
type CapturedImageState = string | null;

export function CameraCapture() {
  // States: 'idle' (default/permission needed), 'streaming', 'captured'
  const [status, setStatus] = useState<CameraState>("ask-permission");
  const [capturedImage, setCapturedImage] = useState<CapturedImageState>(null);

  const requestPermission = () => {
    setStatus("video");
  };

  const captureImage = () => {
    setCapturedImage("data:image/png;base64,placeholder-image-data");
    setStatus("captured");
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setStatus("video");
  };

  let captureButtonText;
  let captureButtonAction;

  if (status === "ask-permission") {
    captureButtonText = "카메라 허용";
    captureButtonAction = requestPermission;
  } else if (status === "video") {
    captureButtonText = "찍다";
    captureButtonAction = captureImage;
  } else {
    captureButtonText = "다시 찍다";
    captureButtonAction = retakeImage;
  }

  const renderVideoArea = () => {
    if (status === "ask-permission") {
      return (
        <div className="aspect-video w-full bg-gray-900 flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-600 p-8">
          <Camera className="w-12 h-12 text-gray-500 mb-3" />
          <span className="text-gray-400">
            카메라 권한이 필요하다.
          </span>
        </div>
      );
    } else if (status === "video") {
      return (
        <div className="aspect-video w-full bg-black flex items-center justify-center rounded-xl overflow-hidden shadow-inner border border-gray-600">
          <span className="text-gray-500">TODO: VIDEO COMPONENT</span>
        </div>
      );
    } else {
      // 'captured'
      return (
        <div className="aspect-video w-full bg-gray-950 flex items-center justify-center rounded-xl overflow-hidden shadow-inner border border-gray-500">
          <span className="text-cyan-400 font-bold text-lg">TODO: CAPTURED IMAGE</span>
        </div>
      );
    }
  };

  return (
    <div className="bg-gray-800 p-3 rounded-2xl shadow-xl border border-gray-700">

      {renderVideoArea()}

      <div className="mt-4 flex space-x-4">
        {/* Capture/Retake Button */}
        <button
          onClick={captureButtonAction}
          className="flex-1 flex items-center justify-center p-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-fuchsia-900/50 disabled:opacity-50"
        >
          <Camera className="w-5 h-5 mr-2" />
          {captureButtonText}
        </button>

        {/* Submit Button (Disabled unless image is captured) */}
        <button
          disabled={status !== "captured"}
          className="flex-1 flex items-center justify-center p-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition transform hover:scale-[1.02] shadow-lg shadow-cyan-900/50 disabled:bg-gray-700 disabled:text-gray-400 disabled:shadow-none"
          aria-label="Submit captured image for check"
        >
          <Send className="w-5 h-5 mr-2" />
          Fit Check
        </button>
      </div>
    </div>
  );
};
