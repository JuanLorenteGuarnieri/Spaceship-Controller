import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import Loader from '../components/Loader'
import { Desk } from '../models/Desk'
import { ContactShadows, Environment, Float, MapControls } from '@react-three/drei'
import CameraController from '../components/CameraController';

const CameraControls = () => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const rotateLeft = useRef(false);
  const rotateRight = useRef(false);
  const rotateUp = useRef(false);
  const rotateDown = useRef(false);

  const currentMovementSpeed = useRef(0);
  const currentRotationSpeedY = useRef(0);
  const currentRotationSpeedX = useRef(0);

  const movementAcceleration = 0.005;
  const rotationAcceleration = 0.001;
  const maxMovementSpeed = 0.1;
  const maxRotationSpeed = 0.05;

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'w':
          moveForward.current = true;
          break;
        case 's':
          moveBackward.current = true;
          break;
        case 'a':
          rotateLeft.current = true;
          break;
        case 'd':
          rotateRight.current = true;
          break;
        case ' ':
          rotateDown.current = true;
          break;
        case 'Shift':
          rotateUp.current = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.key) {
        case 'w':
          moveForward.current = false;
          break;
        case 's':
          moveBackward.current = false;
          break;
        case 'a':
          rotateLeft.current = false;
          break;
        case 'd':
          rotateRight.current = false;
          break;
        case ' ':
          rotateDown.current = false;
          break;
        case 'Shift':
          rotateUp.current = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    if (moveForward.current) {
      currentMovementSpeed.current = Math.min(currentMovementSpeed.current + movementAcceleration, maxMovementSpeed);
    } else if (moveBackward.current) {
      currentMovementSpeed.current = Math.max(currentMovementSpeed.current - movementAcceleration, -maxMovementSpeed);
    } else {
      currentMovementSpeed.current *= 0.96; // Desacelerar
    }

    // Aceleración y desaceleración de la rotación
    let quaternionY = new THREE.Quaternion();
    let quaternionX = new THREE.Quaternion();
    if (rotateLeft.current) {
      currentRotationSpeedY.current = Math.min(currentRotationSpeedY.current + rotationAcceleration, maxRotationSpeed);
    } else if (rotateRight.current) {
      currentRotationSpeedY.current = Math.max(currentRotationSpeedY.current - rotationAcceleration, -maxRotationSpeed);
    } else {
      currentRotationSpeedY.current *= 0.9; // Desacelerar
    }

    quaternionY.setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentRotationSpeedY.current); // Eje Y para rotación izquierda/derecha

    if (rotateUp.current) {
      currentRotationSpeedX.current = Math.max(currentRotationSpeedX.current - rotationAcceleration, -maxRotationSpeed);
    } else if (rotateDown.current) {
      currentRotationSpeedX.current = Math.min(currentRotationSpeedX.current + rotationAcceleration, maxRotationSpeed);
    } else {
      currentRotationSpeedX.current *= 0.9; // Desacelerar
    }

    quaternionX.setFromAxisAngle(new THREE.Vector3(1, 0, 0), currentRotationSpeedX.current); // Eje X para rotación arriba/abajo

    // Aplicar la rotación en el espacio local
    camera.quaternion.multiplyQuaternions(quaternionY, camera.quaternion); // Rotación Y
    camera.quaternion.multiplyQuaternions(camera.quaternion, quaternionX); // Rotación X
    // Mover la cámara en la dirección actualizada
    camera.position.addScaledVector(direction, currentMovementSpeed.current);
  });

  return null;
};



function Home() {
  const [cameraDirection, setCameraDirection] = useState("0, 0, 0");
  const [cameraUp, setCameraUp] = useState("0, 1, 0");


  return (

    <section className="w-full h-screen relative">
      {/* PopUp con info de direccion camara y arriba camara
       <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
          <p>Camera Direction: {cameraDirection}</p><p>Camera Up: {cameraUp}</p>
          </h1>
      </div> */}
      {/*<div className="absolute top-28 left-0 right-0 z-10 flex items-center justify-center">
        POPUP
      </div>*/}

      <Canvas className="w-full h-screen bg-transparent"
        camera={{ near: 0.1, far: 1000 }}>
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, -3, 2]} />
        <directionalLight />
        <CameraController setCameraDirection={setCameraDirection} setCameraUp={setCameraUp} />
        <Environment
          background={true} // can be true, false or "only" (which only sets the background) (default: false)
          blur={0.00} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
          files={[
            'right.png', // px
            'left.png',  // nx
            'top.png',   // py
            'bot.png',   // ny
            'front.png', // pz
            'back.png'   // nz
          ]}
          path="/src/assets/bkg/lightblue/"
          preset={null}
          scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
          encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
        />

        <Float
          speed={1} // Animation speed, defaults to 1
          rotationIntensity={1} // XYZ rotation intensity, defaults to 1
          floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
          floatingRange={[0, 0.5]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
          <Desk />

        </Float>



        <Suspense fallback={<Loader />} >
        </Suspense>
      </Canvas>
    </section>

  )
}

export default Home