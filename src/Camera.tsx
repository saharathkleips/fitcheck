import { useEffect, useRef, useState } from "react";

export default function Camera(){
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    const startCamera = async () => {
        const s = await navigator.mediaDevices.getUserMedia({
            video: {facingMode: "user"},
            audio: false,
        })
        setStream(s);
        const v = videoRef.current!;
        v.srcObject = s;
        await v.play();
    };

    const takePhoto = () => {
        const v = videoRef.current!;
        const c = canvasRef.current!;
        c.width = v.videoWidth;
        c.height = v.videoHeight;
        const ctx = c.getContext("2d")!;
        ctx.drawImage(v, 0, 0, c.width, c.height);

    // Blob → Object URL (임시 링크, 메모리 기반)
        c.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            // 이전 URL 정리
            if (photoUrl) URL.revokeObjectURL(photoUrl);
            setPhotoUrl(url);
        }, "image/jpeg", 0.9);
    };

    useEffect(() => {
        return() => stream?.getTracks().forEach(t => t.stop());
    }, [stream]);



    return (
    <div style={{ display: "grid", gap: 12, maxWidth: 480 }}>
      <video ref={videoRef} playsInline muted style={{ width: "100%", background: "#000", borderRadius: 8 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={startCamera}>카메라 시작</button>
        <button onClick={takePhoto} disabled={!stream}>사진 찍기</button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {photoUrl && (
        <div style={{ display: "grid", gap: 8 }}>
          <img src={photoUrl} alt="captured" style={{ width: "100%", borderRadius: 8 }} />
          <a href={photoUrl} download={`photo_${Date.now()}.jpg`}>
            사진 다운로드
          </a>
        </div>
      )}
    </div>
  );
}