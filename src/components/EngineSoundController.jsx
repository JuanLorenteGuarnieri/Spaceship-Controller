import { useEffect, useRef, useState } from 'react';
import engineOn from '/public/audio/engineOn.mp3';
import engineOff from '/public/audio/engineOff.mp3';


const EngineSoundPlayer = ({ isForward }) => {
  const audioContextRef = useRef(new (window.AudioContext || window.webkitAudioContext)());
  const sourceRef = useRef(null);
  const gainNodeRef = useRef(null);
  const [prevIsForward, setPrevIsForward] = useState(isForward);

  useEffect(() => {
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.4; // Ajusta el volumen al 50%
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      audioContextRef.current.close();
    };
  }, []);

  const playSound = (soundFile, loop = false) => {
    if (audioContextRef.current.state === 'closed') {
      // Re-inicializa el AudioContext si fue cerrado previamente
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 0.4;
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    fetch(soundFile)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        if (sourceRef.current) {
          sourceRef.current.disconnect();
        }
        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = audioBuffer;
        sourceRef.current.loop = false;
        sourceRef.current.connect(gainNodeRef.current);
        sourceRef.current.start(0);
      })
      .catch(e => console.error('Error loading audio file:', e));
  };

  useEffect(() => {
    if (isForward !== prevIsForward) {
      if (isForward) {
        playSound(engineOn);
      } else {
        playSound(engineOff);
        if (sourceRef.current) {
          sourceRef.current.onended = null; // Evita que se reproduzca engineContinue después de engineOff
          sourceRef.current.stop();
        }
      }
      setPrevIsForward(isForward);
    }
  }, [isForward, prevIsForward]);

  return null;
};

export default EngineSoundPlayer;
