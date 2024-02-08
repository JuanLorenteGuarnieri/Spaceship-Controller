import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Bvh, Circle, useProgress } from '@react-three/drei'
import { SpaceStation } from '../../public/models/SpaceStation';
import * as THREE from 'three'
import { Stargate } from '../../public/models/Stargate';
import CameraController from '../components/CameraController';
import Loader from '../components/Loader';
import InitCameraController from '../components/InitCameraController';

import titleImage from '../assets/title.png';
import { SpaceShip } from '../../public/models/Spaceship';
import Joystick from '../components/Joystick';

import boost from '/public/audio/boost.mp3';
import hit from '/public/audio/hit.mp3';


/*
  TODO: HUD

  TODO: Mobile control option
*/


function Home() {
  const spaceShipRef = useRef();
  const spaceStationRef = useRef();
  const puntoControlRef = useRef();

  const [start, setStart] = useState(false);

  const [showResult, setShowResult] = useState(false);


  const [currentMovementSpeed, setCurrentMovementSpeed] = useState(0);

  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });


  const [stargateCurrent, setStargateCurrent] = useState(0);
  const [isForward, setIsForward] = useState(false);
  const [isBackward, setIsBackward] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isLeft, setIsLeft] = useState(false);
  const [isRight, setIsRight] = useState(false);
  const [isClockwise, setIsClockwise] = useState(false);
  const [isCounterClockwise, setIsCounterClockwise] = useState(false);

  const [counter, setCounter] = useState(0); // Contador de tiempo
  const [isCounting, setIsCounting] = useState(false); // Estado para saber si está contando
  const requestRef = useRef(); // Referencia para la animación

  // Ref para el canvas
  const canvasRef = useRef(null);

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function nextGate(nMax) {
    setStargateCurrent(current => {
      // Asumiendo que quieres ciclar de vuelta al primer stargate después del último
      const nextIndex = current >= nMax - 1 ? 0 : current + 1;

      if (nextIndex === 1) {
        setIsCounting(true); // Iniciar el contador
      }
      // Detener contador si current es igual a nMax
      else if (nextIndex === 0) {
        setIsCounting(false); // Detener el contador
        setShowResult(true);
      }
      return nextIndex;
    });
  }

  const materialColision = new THREE.MeshBasicMaterial({ visible: false, color: 0xffffff, opacity: 0.0, transparent: true });
  const materialStargateCurrent = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.15, transparent: true });
  materialStargateCurrent.side = THREE.DoubleSide;

  // Definir collisionObjects como un array regular
  let collisionObjects = useRef({
    torusGroup: null,
    spaceStationGroup: null
  });
  const stargates = [];

  const positions = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1 / Math.SQRT2, 1 / Math.SQRT2, 0), new THREE.Vector3(-1 / Math.SQRT2, -1 / Math.SQRT2, 0), new THREE.Vector3(1 / Math.SQRT2, -1 / Math.SQRT2, 0), new THREE.Vector3(-1 / Math.SQRT2, 1 / Math.SQRT2, 0),
  ];

  const rotations = [
    new THREE.Euler(0, 0, 0), new THREE.Euler(0, 0, 0), new THREE.Euler(0, 0, Math.PI / 2), new THREE.Euler(0, 0, Math.PI / 2), new THREE.Euler(0, 0, Math.PI / 4), new THREE.Euler(0, 0, Math.PI / 4), new THREE.Euler(0, 0, -Math.PI / 4), new THREE.Euler(0, 0, -Math.PI / 4),
  ];

  function createStarGate(center, radius, rotate) {    // Añadir propiedades para una nueva instancia de Stargate
    stargates.push({
      position: center, // Solo como ejemplo, añade los detalles necesarios
      scale: radius,
      rotate: rotate,
      orden: stargates.length
    });
  }
  createStarGate(new THREE.Vector3(0, 0, -45), 15, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -115), 13, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -205), 11, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -302), 9, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -370), 7, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -450), 5, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -500), 2, [0, 0, 0]);
  createStarGate(new THREE.Vector3(-1, -10, -550), 6, [0, 0.5, 0]);
  createStarGate(new THREE.Vector3(-40, -20, -610), 7, [0, Math.PI / 3, 0]);
  createStarGate(new THREE.Vector3(-110, -20, -640), 7, [0, Math.PI / 3.5, 0]);
  createStarGate(new THREE.Vector3(-180, -6, -740), 7, [0, Math.PI / 8, 0]);
  createStarGate(new THREE.Vector3(-160, 15, -810), 8, [0, -Math.PI / 15, 0]);
  createStarGate(new THREE.Vector3(-130, 5, -870), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-110, -50, -890), 5, [Math.PI / 2, 0.6, 0]);
  createStarGate(new THREE.Vector3(10, -90, -850), 15, [Math.PI / 8, 1.5, 0]);
  createStarGate(new THREE.Vector3(100, -70, -890), 14, [1.4, -0.8, 0]);
  createStarGate(new THREE.Vector3(110, 10, -900), 10, [1.4, 0, 0]);
  createStarGate(new THREE.Vector3(70, 30, -880), 8, [-0.1, -0.8, 0]);
  createStarGate(new THREE.Vector3(60, 35, -830), 5, [-0.1, -0.4, 0]);
  createStarGate(new THREE.Vector3(10, 55, -770), 5, [-0.1, -0.4, 0]);
  createStarGate(new THREE.Vector3(-10, 110, -780), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-10, 170, -780), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-10, 270, -780), 14, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(0.2, 203, -773.4), 3, [Math.PI / 2 + 0.1, 0, 0]);

  const spaceStationGroup = new THREE.Group(); // Grupo para contener todos los cubos

  let torusGroup = new THREE.Group(); // Grupo para contener todos los cubos


  // parametros colisiones spaaceship
  const positions2 = [
    new THREE.Vector3(1, 105, -785.5),
    new THREE.Vector3(0, -10, -800),
    new THREE.Vector3(0, -10, -800),
    new THREE.Vector3(-140, -25, -685),
    new THREE.Vector3(140, 2.5, -915),
    new THREE.Vector3(115, -29, -660),
    new THREE.Vector3(-115, 7, -940),
    new THREE.Vector3(0, 14, -980),
    new THREE.Vector3(0, -34, -620),
    new THREE.Vector3(180, -10, -800),
    new THREE.Vector3(-180, -10, -800),
    new THREE.Vector3(-0.5, -225, -829.5),
    new THREE.Vector3(-0.5, -92.5, -814.5),
    new THREE.Vector3(1, 50, -791.5),
  ];
  const rotations2 = [
    new THREE.Euler(0.115, 0.00, 0.00),
    new THREE.Euler(0.15, 1, 0),
    new THREE.Euler(0.15, 0.7, 0),
    new THREE.Euler(0.15, 0.7, 0),
    new THREE.Euler(0.15, 0.7, 0),
    new THREE.Euler(0.15, 0.7, 0),
    new THREE.Euler(0.15, 0.7, 0),
    new THREE.Euler(0.15, -0.1, 0),
    new THREE.Euler(0.15, -0.1, 0),
    new THREE.Euler(0.15, -0.1, 0),
    new THREE.Euler(0.15, -0.1, 0),
    new THREE.Euler(0.115, 0.00, 0.00),
    new THREE.Euler(0.115, -0.5, 0.00),
    new THREE.Euler(0.115, 0.00, 0.00),
  ];
  const scales2 = [
    new THREE.Vector3(10, 195, 10),
    new THREE.Vector3(120, 75, 120),
    new THREE.Vector3(250, 20, 250),
    new THREE.Vector3(50, 7, 200),
    new THREE.Vector3(50, 7, 200),
    new THREE.Vector3(200, 7, 50),
    new THREE.Vector3(200, 7, 50),
    new THREE.Vector3(200, 7, 50),
    new THREE.Vector3(200, 7, 50),
    new THREE.Vector3(50, 7, 200),
    new THREE.Vector3(50, 7, 200),
    new THREE.Vector3(10, 460, 10),
    new THREE.Vector3(45, 150, 45),
    new THREE.Vector3(25, 45, 25),
  ];

  if (spaceShipRef.current) {
    if (stargates[stargateCurrent] && spaceShipRef.current.position.z < -25) {  //añadir colosiones gate

      // Calcular la distancia entre la nave espacial y el stargate actual
      const distanceToStargate = spaceShipRef.current.position.distanceTo(stargates[stargateCurrent].position);
      torusGroup = new THREE.Group();
      // Comprobar si la distancia es menor o igual a dos veces el scale del stargate actual
      if (distanceToStargate <= 2 * stargates[stargateCurrent].scale) {
        positions.forEach((position, index) => {
          const cubeGeometry = new THREE.BoxGeometry(stargates[stargateCurrent].scale / 4, stargates[stargateCurrent].scale, stargates[stargateCurrent].scale / 6);
          const cube = new THREE.Mesh(cubeGeometry, materialColision);
          cube.name = "Stargate Collision part: " + index;
          cube.position.copy(position.multiplyScalar(stargates[stargateCurrent].scale));
          if (rotations[index]) {
            cube.rotation.copy(rotations[index]);
          }
          torusGroup.add(cube); // Añadir el qbo al grupo
        });

        torusGroup.rotation.set(...stargates[stargateCurrent].rotate); // Aplicar rotación al grupo
        torusGroup.position.copy(stargates[stargateCurrent].position);
        if (collisionObjects.current.torusGroup == null) {
          collisionObjects.current.torusGroup = torusGroup; // Añadir el grupo a la lista de objetos de colisión
        }

      }
    }

    if (spaceShipRef.current.position.z < -500) {  //añadir colosiones spacestation

      positions2.forEach((position, index) => {
        const cubeGeometry = new THREE.BoxGeometry(scales2[index].x, scales2[index].y, scales2[index].z);
        const cube = new THREE.Mesh(cubeGeometry, materialColision);
        cube.name = "SpaceStation Collision part: " + index;
        cube.position.copy(position);
        if (rotations2[index]) {
          cube.rotation.copy(rotations2[index]);
        }
        spaceStationGroup.add(cube); // Añadir el cubo al grupo
      });
      if (collisionObjects.current.spaceStationGroup == null) {
        collisionObjects.current.spaceStationGroup = spaceStationGroup; // Añadir el grupo a la lista de objetos de colisión
      }
    }
  }

  useEffect(() => {
    collisionObjects.current.torusGroup = null;
  }, [stargateCurrent]);

  // Efecto para manejar el contador
  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
      if (!isCounting) { // Verifica si isCounting es false para detener la animación
        cancelAnimationFrame(requestRef.current); // Cancela la animación actual
        return; // Sale de la función para no continuar con la animación
      }
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convertir a segundos
      lastTime = now;
      if (isCounting) {
        setCounter(prevCounter => prevCounter + deltaTime);
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    if (isCounting) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isCounting]);

  const [isOpen, setIsOpen] = useState(false);

  const [keyConfig, setKeyConfig] = useState({
    up: 'W',
    left: 'A',
    right: 'D',
    down: 'S',
    counterClockwise: 'Q',
    clockwise: 'E',
    forward: ' ',
    backward: 'SHIFT',
  });

  const [keyConfigPreview, setKeyConfigPreview] = useState({
    up: 'W',
    left: 'A',
    right: 'D',
    down: 'S',
    counterClockwise: 'Q',
    clockwise: 'E',
    forward: 'SPACE',
    backward: 'SHIFT',
  });
  // Estado para saber cuál tecla está siendo configurada
  const [currentKeySettingSelected, setCurrentKeySettingSelected] = useState('');

  const handleClick = (keyType) => {
    setCurrentKeySettingSelected(current => {
      if (currentKeySettingSelected != '') {
        setKeyConfigPreview(prevState => ({
          ...prevState,
          [current]: keyConfig[current] == ' ' ? 'SPACE' : keyConfig[current]
        }));
      }
      return keyType;
    });
    setKeyConfigPreview(prevState => ({
      ...prevState,
      [keyType]: '...'
    }));
  };


  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      event.preventDefault();
    }
    if (isOpen) {
      // Verificar si la tecla no está asignada a ningún otro elemento de keyConfig
      const isKeyNameAssigned = Object.values(keyConfig).some(value => value === event.key.toUpperCase());

      if (currentKeySettingSelected != '' && (!isKeyNameAssigned || keyConfig[currentKeySettingSelected] == event.key.toUpperCase())) { //comprobar si la tecla pulsada ya esta asignada en keyConfig
        setKeyConfigPreview(prevState => ({
          ...prevState,
          [currentKeySettingSelected]: event.key === ' ' ? 'SPACE' : event.key.toUpperCase(),
        }));
        setKeyConfig(prevState => ({
          ...prevState,
          [currentKeySettingSelected]: event.key.toUpperCase(),
        }));
        // Detiene la escucha de eventos de teclado y resetea el configurador actual
        setCurrentKeySettingSelected('');
      }
    } else {
      if (!showResult && !isMobileDevice()) {
        if (event.key.toUpperCase() == keyConfig.down) {
          setIsDown(true);
        }
        if (event.key.toUpperCase() == keyConfig.up) {
          setIsUp(true);
        }
        if (event.key.toUpperCase() == keyConfig.left) {
          setIsLeft(true);
        }
        if (event.key.toUpperCase() == keyConfig.right) {
          setIsRight(true);
        }
        if (event.key.toUpperCase() == keyConfig.clockwise) {
          setIsClockwise(true);
        }
        if (event.key.toUpperCase() == keyConfig.counterClockwise) {
          setIsCounterClockwise(true);
        }
        if (event.key.toUpperCase() == keyConfig.backward) {
          setIsBackward(true);
          setIsForward(false);
        } else if (event.key.toUpperCase() == keyConfig.forward && !isBackward) {
          setIsForward(true);
        }
      }
    }
  };

  const handleKeyUp = (event) => {
    if (!isMobileDevice()) {
      setTargetRotation({ x: 0, y: 0, z: 0 });
      if (event.key.toUpperCase() == keyConfig.down) {
        setIsDown(false);
      }
      if (event.key.toUpperCase() == keyConfig.up) {
        setIsUp(false);
      }
      if (event.key.toUpperCase() == keyConfig.left) {
        setIsLeft(false);
      }
      if (event.key.toUpperCase() == keyConfig.right) {
        setIsRight(false);
      }
      if (event.key.toUpperCase() == keyConfig.clockwise) {
        setIsClockwise(false);
      }
      if (event.key.toUpperCase() == keyConfig.counterClockwise) {
        setIsCounterClockwise(false);
      }
      if (event.key.toUpperCase() == keyConfig.backward) {
        setIsBackward(false);
      }
      if (event.key.toUpperCase() == keyConfig.forward) {
        setIsForward(false);
      }
    }
  };


  useEffect(() => {  //add listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentKeySettingSelected, isOpen, showResult, isBackward]);


  // ANIMATIONS
  const [animationKey, setAnimationKey] = useState(0);
  const [animationClass, setAnimationClass] = useState('fadeIn1'); // Inicializa con la animación inicial

  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);


  const changeAnimationDone = () => {
    setIsAnimationDone(true);
  };

  const { progress } = useProgress();

  useEffect(() => {
    // Actualiza el estado cuando el progreso es mayor que 95
    if (progress > 95) {
      setIsContentLoaded(true);
    }
  }, [progress]);


  useEffect(() => { //RESET ANIMATION (when all loaded and intro finished)
    if (isContentLoaded && isAnimationDone) {
      setAnimationClass('fadeOutIn');
      setAnimationKey(prevKey => prevKey + 1); // Incrementa la clave para reiniciar la animación
    }
  }, [isContentLoaded, isAnimationDone]);

  useEffect(() => {
    if (start == true) {
      spaceShipRef.current.position.subVectors(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0));
      spaceShipRef.current.rotation.set(0, 0, 0);
    }

  }, [start]);

  //{SOUNDS

  const audioBoostContextRef = useRef(null);
  const audioHitContextRef = useRef(null);

  const initPlaySound = () => {
    // Inicializa AudioContext solo una vez
    if (!audioBoostContextRef.current) {
      audioBoostContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!audioHitContextRef.current) {
      audioHitContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

  }


  const playBoostSound = () => {
    if (!audioBoostContextRef.current) {
      audioBoostContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const source = audioBoostContextRef.current.createBufferSource();
    const gainNode = audioBoostContextRef.current.createGain(); // Crea un GainNode para controlar el volumen

    gainNode.gain.value = 1; // Ajusta el volumen al 50%

    fetch(boost)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioBoostContextRef.current.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        source.buffer = audioBuffer;
        source.connect(gainNode); // Conecta la fuente al GainNode
        gainNode.connect(audioBoostContextRef.current.destination); // Conecta el GainNode al destino (salida de audio)
        source.start(0);
      })
      .catch(e => console.error('Error loading audio file:', e));
  };

  const playHitSound = () => {
    if (!audioHitContextRef.current) {
      audioHitContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const source = audioHitContextRef.current.createBufferSource();
    const gainNode = audioHitContextRef.current.createGain(); // Crea un GainNode para controlar el volumen

    gainNode.gain.value = 1; // Ajusta el volumen al 50%

    fetch(hit)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioHitContextRef.current.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        source.buffer = audioBuffer;
        source.connect(gainNode); // Conecta la fuente al GainNode
        gainNode.connect(audioHitContextRef.current.destination); // Conecta el GainNode al destino (salida de audio)
        source.start(0);
      })
      .catch(e => console.error('Error loading audio file:', e));
  };

  const playHit = () => {
    if (audioHitContextRef.current.state === 'suspended') {
      audioHitContextRef.current.resume().then(playHitSound);
    } else {
      playHitSound();
    }
  }

  const playBoost = () => {
    if (audioBoostContextRef.state === 'suspended') {
      audioBoostContextRef.resume().then(playBoostSound);
    } else {
      playBoostSound();
    }
  }

  //SOUNDS}

  function formatCounter(counter) {
    let formatted = counter.toFixed(2) + " s"; // Formato básico con 2 decimales
    if (formatted.length > 6) {
      // Si la longitud excede 5 caracteres, intenta reducir la precisión
      formatted = counter.toFixed(1) + " s";
      if (formatted.length > 6) {
        // Si todavía es demasiado largo, muestra sin decimales
        formatted = Math.round(counter) + " s";
      }
    }
    return formatted;
  }


  return (
    <section className="w-full h-screen relative" style={{ backgroundColor: 'black' }}>
      {isAnimationDone && !start &&
        <div className='fadeIn1 absolute z-10'
          style={{ top: '50%', right: '50%', transform: 'translate(25%, 25%)' }}>
          <button style={{ marginLeft: '5rem', height: '2.5rem', width: '6rem', backgroundColor: 'rgb(43, 119, 231)', color: 'white', borderRadius: '0.5rem' }} className="focus:outline-none"
            onClick={() => {
              setStart(true);
              initPlaySound();
            }}>
            START
          </button>
        </div>
      }

      {isAnimationDone && !start &&
        <div className='fadeIn1 absolute z-10'
          style={{ top: '20%', right: '50%', transform: 'translate(50%, 50%)' }}>
          <img src={titleImage} />
        </div>
      }

      {isAnimationDone && start &&
        <div className='fadeIn1' style={{ backgroundColor: 'black' }}>
          {showResult && (
            <div style={{
              height: '80%',
              width: '70%',
              top: '50%',
              left: '50%',
              borderRadius: '20px',
              backgroundColor: 'rgba(43, 79, 151, 0.3)',
              transform: 'translate(-50%, -50%)'
            }} className="absolute bg-white py-1 z-50 flex flex-col justify-around items-center">
              <div style={{ height: '1%' }} />
              <h2 style={{ fontSize: 55 }} className="text-xl font-bold text-white">¡Complete!</h2>
              <p style={{ fontSize: 35 }} className="text-white">Time: {counter.toFixed(2)} s</p>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}> {/* Añade estilos de flexibilidad aquí */}
                <button style={{ height: '2.5rem', width: '6rem', backgroundColor: 'rgb(43, 119, 231)', color: 'white', borderRadius: '0.5rem' }} className="focus:outline-none"
                  onClick={() => {
                    setCurrentMovementSpeed(0);
                    spaceShipRef.current.position.subVectors(spaceShipRef.current.position, spaceShipRef.current.position);
                    spaceShipRef.current.rotation.set(0, 0, 0);
                    setShowResult(false);
                    setCounter(0); // Reiniciar contador
                  }}>
                  Restart
                </button>
              </div>


            </div>
          )}
          {isAnimationDone && start && isCounting && (
            <div className='absolute z-10 flex flex-col items-center justify-center'
              style={{
                top: '5%',
                left: '2.5%',
                borderRadius: '20px',
                padding: '1rem', // Añade padding alrededor de los botones dentro del contenedor
                gap: '10px', // Esto no funcionará directamente en el estilo inline, ver nota abajo
              }}>
              <button
                style={{
                  height: '2.5rem',
                  backgroundColor: 'rgb(43, 119, 231)',
                  color: 'white',
                  padding: '0 1rem',
                  borderRadius: '0.5rem',
                  // No necesitas margen para el último botón, a menos que planees añadir más botones después
                }}
                className="focus:outline-none">
                {stargateCurrent}/{stargates.length}
              </button>
              <button
                style={{
                  height: '2.5rem',
                  backgroundColor: 'rgb(43, 119, 231)',
                  color: 'white',
                  padding: '0 1rem',
                  borderRadius: '0.5rem',
                  marginBottom: '10px', // Añade un margen abajo al primer botón
                }}
                className="focus:outline-none">
                {formatCounter(counter)}
              </button>
            </div>
          )}

          {isMobileDevice() && (
            <>
              <div className='absolute z-10 flex '
                style={{
                  bottom: '0%',
                  left: '0%',
                  borderRadius: '20px',
                  gap: '10px', // Esto no funcionará directamente en el estilo inline, ver nota abajo
                }}>
                <Joystick setIsUp={setIsUp} setIsDown={setIsDown} setIsRight={setIsRight} setIsLeft={setIsLeft} setTargetRotation={setTargetRotation} />
                <div className='absolute z-10 flex '
                  style={{
                    bottom: '7rem',
                    left: '0.9rem',
                    borderRadius: '20px',
                    gap: '30px', // Esto no funcionará directamente en el estilo inline, ver nota abajo
                  }}>
                  <button
                    style={{
                      height: '2.5rem',
                      backgroundColor: 'rgb(43, 119, 231)',
                      color: 'white',
                      padding: '0 0.3rem',
                      borderRadius: '99rem',
                      // No necesitas margen para el último botón, a menos que planees añadir más botones después
                    }}
                    className="focus:outline-none"
                    onTouchStart={() => setIsCounterClockwise(true)}
                    onTouchEnd={() => {
                      setIsCounterClockwise(false);
                      setTargetRotation({ x: 0, y: 0, z: 0 });
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z" />
                      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
                    </svg>
                  </button>
                  <button
                    style={{
                      height: '2.5rem',
                      backgroundColor: 'rgb(43, 119, 231)',
                      color: 'white',
                      padding: '0 0.3rem',
                      borderRadius: '99rem',
                      marginBottom: '10px', // Añade un margen abajo al primer botón
                    }}
                    className="focus:outline-none"
                    onTouchStart={() => setIsClockwise(true)}
                    onTouchEnd={() => {
                      setIsClockwise(false);
                      setTargetRotation({ x: 0, y: 0, z: 0 });
                    }}
                  >

                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className='absolute z-10 flex '
                style={{
                  bottom: '5%',
                  right: '2.5%',
                  borderRadius: '20px',
                  gap: '10px', // Esto no funcionará directamente en el estilo inline, ver nota abajo
                }}>
                <button
                  style={{
                    height: '2.5rem',
                    backgroundColor: 'rgb(43, 119, 231)',
                    color: 'white',
                    padding: '0 0.3rem',
                    borderRadius: '0.5rem',
                    // No necesitas margen para el último botón, a menos que planees añadir más botones después
                  }}
                  className="focus:outline-none"
                  onTouchStart={() => setIsBackward(true)}
                  onTouchEnd={() => setIsBackward(false)}
                >

                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-forward-fill" viewBox="0 0 16 16"
                    style={{ transform: 'scaleX(-1)' }}>
                    <path d="m9.77 12.11 4.012-2.953a.647.647 0 0 0 0-1.114L9.771 5.09a.644.644 0 0 0-.971.557V6.65H2v3.9h6.8v1.003c0 .505.545.808.97.557" />
                  </svg>
                </button>
                <button
                  style={{
                    height: '2.5rem',
                    backgroundColor: 'rgb(43, 119, 231)',
                    color: 'white',
                    padding: '0 0.3rem',
                    borderRadius: '0.5rem',
                    marginBottom: '10px', // Añade un margen abajo al primer botón
                  }}
                  className="focus:outline-none"
                  onTouchStart={() => setIsForward(true)}
                  onTouchEnd={() => setIsForward(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="white" className="bi bi-forward-fill" viewBox="0 0 16 16" >
                    <path d="m9.77 12.11 4.012-2.953a.647.647 0 0 0 0-1.114L9.771 5.09a.644.644 0 0 0-.971.557V6.65H2v3.9h6.8v1.003c0 .505.545.808.97.557" />
                  </svg>
                </button>
              </div>

            </>
          )}


          {!isMobileDevice() && (
            <div className="absolute inset-0 z-10 flex items-center "
              style={{ left: '1%' }}>

              <button
                className="relative h-12 w-9 text-white bg-blue-500 rounded-md focus:outline-none focus:outline-none"
                onClick={() => {
                  if (!showResult) {
                    setIsOpen(!isOpen);
                  }
                }}>
                {isOpen && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) scaleX(-1)'
                    }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {!isOpen && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-joystick" viewBox="0 0 16 16"
                    style={{
                      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
                    }}>
                    <path d="M10 2a2 2 0 0 1-1.5 1.937v5.087c.863.083 1.5.377 1.5.726 0 .414-.895.75-2 .75s-2-.336-2-.75c0-.35.637-.643 1.5-.726V3.937A2 2 0 1 1 10 2" />
                    <path d="M0 9.665v1.717a1 1 0 0 0 .553.894l6.553 3.277a2 2 0 0 0 1.788 0l6.553-3.277a1 1 0 0 0 .553-.894V9.665c0-.1-.06-.19-.152-.23L9.5 6.715v.993l5.227 2.178a.125.125 0 0 1 .001.23l-5.94 2.546a2 2 0 0 1-1.576 0l-5.94-2.546a.125.125 0 0 1 .001-.23L6.5 7.708l-.013-.988L.152 9.435a.25.25 0 0 0-.152.23" />
                  </svg>
                )}
              </button>
              {isOpen && (
                <div style={{ height: '50vh', width: '50vh', borderRadius: '20px', backgroundColor: 'rgba(43, 79, 151, 0.3)' }} className="absolute left-20 bg-white  py-1 z-50 flex flex-col justify-around items-center">
                  <div style={{ height: '5%' }} className="w-full" />
                  <div style={{ height: '70%', position: 'relative' }} className="w-80 ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="55" height="55" fill="white" className="bi bi-dpad-fill" viewBox="0 0 16 16"
                      style={{
                        position: 'absolute', top: '60%', left: '50%', transform: 'translate(-50%, -50%)'
                      }}>
                      <path d="M6.5 0A1.5 1.5 0 0 0 5 1.5v3a.5.5 0 0 1-.5.5h-3A1.5 1.5 0 0 0 0 6.5v3A1.5 1.5 0 0 0 1.5 11h3a.5.5 0 0 1 .5.5v3A1.5 1.5 0 0 0 6.5 16h3a1.5 1.5 0 0 0 1.5-1.5v-3a.5.5 0 0 1 .5-.5h3A1.5 1.5 0 0 0 16 9.5v-3A1.5 1.5 0 0 0 14.5 5h-3a.5.5 0 0 1-.5-.5v-3A1.5 1.5 0 0 0 9.5 0zm1.288 2.34a.25.25 0 0 1 .424 0l.799 1.278A.25.25 0 0 1 8.799 4H7.201a.25.25 0 0 1-.212-.382zm0 11.32-.799-1.277A.25.25 0 0 1 7.201 12H8.8a.25.25 0 0 1 .212.383l-.799 1.278a.25.25 0 0 1-.424 0Zm-4.17-4.65-1.279-.798a.25.25 0 0 1 0-.424l1.279-.799A.25.25 0 0 1 4 7.201V8.8a.25.25 0 0 1-.382.212Zm10.043-.798-1.278.799A.25.25 0 0 1 12 8.799V7.2a.25.25 0 0 1 .383-.212l1.278.799a.25.25 0 0 1 0 .424Z" />
                    </svg>

                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="white" className="bi bi-arrow-clockwise" viewBox="0 0 16 16"
                      style={{
                        position: 'absolute', top: '30%', left: '83%', transform: 'translate(-50%, -50%)'
                      }}>
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
                    </svg>

                    <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="white" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16"
                      style={{
                        position: 'absolute', top: '30%', left: '17%', transform: 'translate(-50%, -50%)'
                      }}>
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z" />
                      <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
                    </svg>
                    <div style={{ height: '50%' }} className="w-full flex">
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%'
                      }}>
                        <button onClick={() => handleClick('counterClockwise')} style={{
                          padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.counterClockwise}
                        </button>
                      </div>
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%'
                      }}>
                        <button onClick={() => handleClick('up')} style={{
                          position: 'absolute', top: '20%', padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.up}
                        </button>
                      </div>
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%'
                      }}>
                        <button onClick={() => handleClick('clockwise')} style={{
                          padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.clockwise}
                        </button>
                      </div>
                    </div>
                    <div style={{ height: '50%' }} className="w-full flex">
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'
                      }}>
                        <button onClick={() => handleClick('left')} style={{
                          position: 'absolute', top: '50%', padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.left}
                        </button>
                      </div>
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'
                      }}>
                        <button onClick={() => handleClick('down')} style={{
                          padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.down}
                        </button>
                      </div>
                      <div style={{
                        width: '33.333333%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'
                      }}>
                        <button onClick={() => handleClick('right')} style={{
                          position: 'absolute', top: '50%', padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                          border: 'none', color: 'white', outline: 'none'
                        }} >
                          {keyConfigPreview.right}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: '30%' }} className="w-full flex">
                    <div style={{ width: '50%' }} className="h-full flex items-center justify-center relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="white" className="bi bi-forward-fill" viewBox="0 0 16 16"
                        style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%) scaleX(-1)' }}>
                        <path d="m9.77 12.11 4.012-2.953a.647.647 0 0 0 0-1.114L9.771 5.09a.644.644 0 0 0-.971.557V6.65H2v3.9h6.8v1.003c0 .505.545.808.97.557" />
                      </svg>
                      <button onClick={() => handleClick('backward')} style={{
                        position: 'absolute', top: '50%', padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                        border: 'none', color: 'white', outline: 'none'
                      }} >
                        {keyConfigPreview.backward}
                      </button>
                    </div>
                    <div style={{ width: '50%' }} className="h-full flex items-center justify-center relative">
                      <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="white" className="bi bi-forward-fill" viewBox="0 0 16 16"
                        style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <path d="m9.77 12.11 4.012-2.953a.647.647 0 0 0 0-1.114L9.771 5.09a.644.644 0 0 0-.971.557V6.65H2v3.9h6.8v1.003c0 .505.545.808.97.557" />
                      </svg>
                      <button onClick={() => handleClick('forward')} style={{
                        position: 'absolute', top: '50%', padding: '10px 20px', fontSize: '20px', backgroundColor: 'rgba(43, 139, 231, 0.9)', opacity: 0.8, borderRadius: '10px',
                        border: 'none', color: 'white', outline: 'none'
                      }} >
                        {keyConfigPreview.forward}
                      </button>
                    </div>
                  </div>
                  <div style={{ height: '5%' }} className="w-full" />

                </div>


              )}
            </div>
          )}

        </div>
      }


      {/* <div className="absolute inset-0 z-10 flex items-center ">
        <div className="group hover:cursor-pointer">
          <div className="bg-black text-white p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="opacity-0 group-hover:opacity-100 group-hover:translate-x-12 transition-transform duration-300 ease-out bg-blue-500 text-white p-4 rounded w-48 h-48">
            <p>Contenido aquí</p>
          </div>
        </div>

      </div> */}

      <Canvas className={animationClass} ref={canvasRef}
        camera={{ far: 10000 }} key={animationKey}>
        {isContentLoaded && isAnimationDone ?
          (
            <Suspense fallback={null} >
              <>
                {collisionObjects.current.torusGroup && (
                  <primitive key="torusGroup" object={collisionObjects.current.torusGroup} />
                )}
                {collisionObjects.current.spaceStationGroup && (
                  <primitive key="spaceStationGroup" object={collisionObjects.current.spaceStationGroup} />
                )}
              </>
              {start &&
                <CameraController spaceShipRef={spaceShipRef} collisionObjects={collisionObjects.current} nextGate={nextGate} nMax={stargates.length}
                  puntoControlRef={puntoControlRef} setIsForward={setIsForward} isForward={isForward} isBackward={isBackward}
                  isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise}
                  currentMovementSpeed={currentMovementSpeed} setCurrentMovementSpeed={setCurrentMovementSpeed}
                  targetRotation={targetRotation} setTargetRotation={setTargetRotation} playBoost={playBoost} playHit={playHit} />
              }

              {!start &&
                <InitCameraController spaceShipRef={spaceShipRef} />
              }


              <Environment
                background={true} // can be true, false or "only" (which only sets the background) (default: false)
                blur={0.01} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
                files={[
                  'right.png', // px
                  'left.png', // nx
                  'top.png', // py
                  'bot.png', // ny
                  'front.png', // pz
                  'back.png' // nz
                ]}
                path="/Spaceship-Controller/bkg/lightblue/"
                preset={null}
                scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
                encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
              /><Bvh firstHitOnly>
                <SpaceStation ref={spaceStationRef} scale={30} position={[0, -10, -800]} rotation={[0, -Math.PI, 0]} />

                <SpaceShip position={[0, 1000, 500]} ref={spaceShipRef} isForward={isForward}
                  isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise} />

                {stargates[stargateCurrent] && (
                  <Circle
                    args={[3, 32, 0, Math.PI * 2]}
                    ref={puntoControlRef}
                    rotation={stargates[stargateCurrent].rotate}
                    position={stargates[stargateCurrent].position}
                    scale={stargates[stargateCurrent].scale / 2.99}
                    material={materialStargateCurrent} />
                )}
                {stargates.filter((stargate) => stargate.orden === stargateCurrent || stargate.orden === stargateCurrent + 1
                ).map((stargate, index) => (
                  <Stargate
                    key={index}
                    position={stargate.position}
                    scale={stargate.scale / 2.99}
                    rotation={stargate.rotate}
                    isEmissive={stargate.orden === stargateCurrent}
                    currentMovementSpeed={currentMovementSpeed} />
                ))}

              </Bvh>
              <directionalLight intensity={5} color={0x8888ff} position={[0, 0, 500]} />
              <directionalLight intensity={5} color={0x8888ff} position={[0, 0, -500]} />
            </Suspense>
          ) : (
            <Loader action={changeAnimationDone} />
          )}


      </Canvas>
    </section >

  )
}

export default Home