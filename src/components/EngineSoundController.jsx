import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';

const EngineSoundController = ({ isForward, currentMovementSpeed, maxMovementSpeed }) => {
  const audioContext = useRef(new AudioContext());
  const gainNode = useRef(null);
  const oscillator = useRef(null);

  // Inicializa el sonido del motor
  const initEngineSound = () => {
    if (!gainNode.current) {
      gainNode.current = audioContext.current.createGain();
    }
    if (!oscillator.current) {
      oscillator.current = audioContext.current.createOscillator();
      oscillator.current.type = 'sine'; // 'sawtooth' o 'square' para un sonido más adecuado a un motor
      oscillator.current.connect(gainNode.current);
      gainNode.current.connect(audioContext.current.destination);
      gainNode.current.gain.value = 0;
      oscillator.current.start(); // Inicia el oscilador
    }
  };

  // Ajusta el sonido del motor basado en la velocidad
  const adjustEngineSound = () => {
    const baseFrequency = 10; // Frecuencia base para el sonido del motor en reposo
    const maxFrequency = 180; // Frecuencia máxima para el sonido del motor a máxima velocidad
    const frequency = baseFrequency + (currentMovementSpeed / maxMovementSpeed) * (maxFrequency - baseFrequency);

    const volume = Math.min(currentMovementSpeed / maxMovementSpeed, 0.01) / 20;
    gainNode.current.gain.value = volume; // Ajusta el volumen basado en currentMovementSpeed
    oscillator.current.frequency.setValueAtTime(frequency, audioContext.current.currentTime); // Ajusta la frecuencia basada en currentMovementSpeed
  };

  useEffect(() => {
    initEngineSound();
  }, []);


  useEffect(() => {
    const startAudioContext = async () => {
      initEngineSound();
      document.removeEventListener('click', startAudioContext);

    };

    document.addEventListener('click', startAudioContext);

    return () => {
      document.removeEventListener('click', startAudioContext);
    };
  }, []);

  useFrame(() => {
    if (isForward) {
      adjustEngineSound(); // Ajusta el sonido mientras la nave se mueve hacia adelante
    } else {
      // Podemos decidir reducir el volumen o ajustar la frecuencia para simular el ralentí del motor aquí
      gainNode.current.gain.value = 0; // Simula un motor en ralentí reduciendo el volumen
    }
  });

  return null;
};

export default EngineSoundController;
