import { useEffect, useRef } from 'react';

const PressureSoundController = ({ conditions }) => {
  const audioContextRef = useRef(null);
  const sourcesRef = useRef([]);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;

    const loadSound = async () => {
      const response = await fetch('public/audio/pressure.mp3');
      const arrayBuffer = await response.arrayBuffer();
      return audioContext.decodeAudioData(arrayBuffer);
    };

    const playSound = async (index) => {
      const audioBuffer = await loadSound();
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();

      gainNode.gain.value = 0.2; // Este valor podría ajustarse según la condición.
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      source.start(0);

      // Guardar la referencia para poder detenerlo más tarde
      sourcesRef.current[index] = { source, gainNode };
    };

    conditions.forEach((condition, index) => {
      if (condition && !sourcesRef.current[index]) {
        playSound(index);
      } else if (!condition && sourcesRef.current[index]) {
        // Detiene y limpia la fuente de audio si la condición ya no se cumple
        sourcesRef.current[index].source.stop();
        sourcesRef.current[index] = null;
      }
    });

  }, [conditions]);

  return null;
};

export default PressureSoundController;
