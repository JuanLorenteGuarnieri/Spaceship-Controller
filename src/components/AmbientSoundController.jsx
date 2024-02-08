import { useEffect, useRef } from 'react';
import ambient from '/public/audio/ambient.mp3';


const AmbientSoundController = ({ isPlaying }) => {
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Inicializa AudioContext solo una vez
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    const playSound = () => {
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain(); // Crea un GainNode para controlar el volumen

      gainNode.gain.value = 0.2; // Ajusta el volumen al 50%

      fetch(ambient)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
          source.buffer = audioBuffer;
          source.loop = true;
          source.connect(gainNode); // Conecta la fuente al GainNode
          gainNode.connect(audioContext.destination); // Conecta el GainNode al destino (salida de audio)
          source.start(0);
        })
        .catch(e => console.error('Error loading audio file:', e));
    };

    if (isPlaying) {
      // Asegura que el contexto de audio esté en estado 'running' para reproducir
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(playSound);
      } else {
        playSound();
      }
    }

    return () => {
      if (audioContext) {
        audioContext.close().then(() => {
          audioContextRef.current = null;
        });
      }
    };
  }, [isPlaying]);

  return null;
};

export default AmbientSoundController;
