import { Camera, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

type CameraState = "no-permission" | "ask-permission" | "video" | "captured";
type CapturedImageState = string | null;

export function CameraCapture() {
  // States: 'idle' (default/permission needed), 'streaming', 'captured'
  const [status, setStatus] = useState<CameraState>("ask-permission");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<CapturedImageState>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const requestPermission = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setStream(s);
      setStatus("video");
    } catch (e) {
    console.error(e);
    }
  };

  const captureImage = () => {
    const v = videoRef.current!;
    const c = document.createElement("canvas"); // 임시 캔버스
    c.width = v.videoWidth;
    c.height = v.videoHeight;

    const ctx = c.getContext("2d")!;
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const imgData = c.toDataURL("image/jpeg"); // Base64 이미지
    setCapturedImage(imgData); // 상태에 저장 (또는 즉시 사용)
    setStatus("captured");
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setStatus("video");
  };

  useEffect(() => {
    if (status !== "video") return;
    const v = videoRef.current;
    if (!v || !stream) return;
    v.srcObject = stream; 
    v.muted = true;
    // @ts-ignore
    v.playsInline = true;
    v.play().catch(() => {});
    return () => { v.srcObject = null; };
  }, [status, stream])


  let captureButtonText;
  let captureButtonAction;

  if (status === "ask-permission") {
    captureButtonText = "카메라 허용";
    captureButtonAction = requestPermission;
  } else if (status === "video") {
    captureButtonText = "촬영";
    captureButtonAction = captureImage;

  } else {
    captureButtonText = "재촬영";
    captureButtonAction = retakeImage;
  }

  const renderVideoArea = () => {
    if (status === "ask-permission") {
      return (
        <div className="aspect-video w-full bg-gray-900 flex flex-col items-center justify-center rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-600 p-8">
          <Camera className="w-12 h-12 text-gray-500 mb-3" />
          <span className="text-gray-400">
            카메라 권한 필요
          </span>
        </div>
      );
    } else if (status === "video") {
      return (
        <div className="aspect-video w-full bg-black flex items-center justify-center rounded-xl overflow-hidden shadow-inner border border-gray-600">
          <video 
            ref = {videoRef}
            autoPlay
            playsInline
            muted
            className = "w-full h-full object-cover"
            />
        </div>
      );
    } else {
      // 'captured'
      return (
        <div className="aspect-video w-full bg-gray-950 flex items-center justify-center rounded-xl overflow-hidden shadow-inner border border-gray-500">
          {capturedImage && (
            <img
              src={capturedImage} className="w-full h-full object-cover rounded-xl" 
            />
          )}
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
