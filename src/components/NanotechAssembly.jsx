import { useEffect, useRef, useState } from "react";

export default function NanotechAssembly({ onDone }) {
  const [opacity, setOpacity] = useState(1);
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setOpacity(0);
      setTimeout(onDone, 650);
    };

    video.addEventListener("ended", handleEnded);

    // Fallback: if video fails or takes too long
    const fallback = setTimeout(() => {
      setOpacity(0);
      setTimeout(onDone, 650);
    }, 12000);

    return () => {
      video.removeEventListener("ended", handleEnded);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99998,
      background: "#010a0e",
      opacity, transition: "opacity 0.65s ease",
      pointerEvents: opacity === 0 ? "none" : "all",
    }}>
      <video
        ref={videoRef}
        src="/nanotech-loading.mp4"
        autoPlay
        muted
        playsInline
        style={{
          width: "100%", height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}
