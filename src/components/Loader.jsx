import { Html, useProgress } from "@react-three/drei";
import { useEffect, useRef } from "react";
import video from '/public/Intro.mp4'; // Ajusta la ruta según la ubicación de tu video


const Loader = ({ action }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      action();
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Html center>
      <div className="container" style={{ height: '100vh', width: '100vw' }}>
        <video ref={videoRef} width="100%" height="100%" muted autoPlay loop={false}>
          <source src={video} type="video/mp4" />
          Tu navegador no soporta videos.
        </video>
      </div>
    </Html>
  );
};

export default Loader;