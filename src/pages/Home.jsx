import { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Bvh, Circle } from '@react-three/drei'
import CameraController from '../components/CameraController';
import { RusticSpaceShip } from '../../public/models/RusticSpaceShip';
import { SpaceStation } from '../../public/models/SpaceStation';
import * as THREE from 'three'
import { Stargate } from '../../public/models/Stargate';
import { OBB } from '../utils/OBB.js';

function Home() {
  const spaceShipRef = useRef();
  const spaceStationRef = useRef();
  const puntoControlRef = useRef();
  const typeCamera = "3P";

  puntoControlRef

  const [stargateCurrent, setStargateCurrent] = useState(1);
  const [isForward, setIsForward] = useState(false);
  const [isUp, setIsUp] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isLeft, setIsLeft] = useState(false);
  const [isRight, setIsRight] = useState(false);
  const [isClockwise, setIsClockwise] = useState(false);
  const [isCounterClockwise, setIsCounterClockwise] = useState(false);

  function nextGate(nMax) {
    setStargateCurrent(current => {
      // Asumiendo que quieres ciclar de vuelta al primer stargate después del último
      const nextIndex = current >= nMax ? 1 : current + 1;
      return nextIndex;
    });
  }

  const materialColision = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.0, transparent: true });
  const materialStargateCurrent = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.15, transparent: true });
  materialStargateCurrent.side = THREE.DoubleSide;

  // Definir collisionObjects como un array regular
  const collisionObjects = [];
  const stargates = [];
  const torusGroup = new THREE.Group(); // Grupo para contener todos los cubos

  const positions = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(1 / Math.SQRT2, 1 / Math.SQRT2, 0), new THREE.Vector3(-1 / Math.SQRT2, -1 / Math.SQRT2, 0), new THREE.Vector3(1 / Math.SQRT2, -1 / Math.SQRT2, 0), new THREE.Vector3(-1 / Math.SQRT2, 1 / Math.SQRT2, 0),
  ];

  const rotations = [
    new THREE.Euler(0, 0, 0), new THREE.Euler(0, 0, 0), new THREE.Euler(0, 0, Math.PI / 2), new THREE.Euler(0, 0, Math.PI / 2), new THREE.Euler(0, 0, Math.PI / 4), new THREE.Euler(0, 0, Math.PI / 4), new THREE.Euler(0, 0, -Math.PI / 4), new THREE.Euler(0, 0, -Math.PI / 4),
  ];

  function createStarGate(center, radius, rotate) {
    // Añadir propiedades para una nueva instancia de Stargate
    stargates.push({
      position: center, // Solo como ejemplo, añade los detalles necesarios
      scale: radius,
      rotate: rotate,
      orden: stargates.length + 1
    });
  }
  createStarGate(new THREE.Vector3(0, 0, -15), 5, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -75), 12, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -145), 5, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -222), 12, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -300), 12, [0, 0, 0]);
  createStarGate(new THREE.Vector3(0, 0, -400), 12, [0, 0, 0]);

  const currentStargate = stargates.find(stargate => stargate.orden === stargateCurrent);
  const spaceStationGroup = new THREE.Group(); // Grupo para contener todos los cubos

  if (currentStargate) {  //añadir colosiones
    positions.forEach((position, index) => {
      const cubeGeometry = new THREE.BoxGeometry(currentStargate.scale / 4, currentStargate.scale, currentStargate.scale / 8);
      const cube = new THREE.Mesh(cubeGeometry, materialColision);
      cube.position.copy(position.multiplyScalar(currentStargate.scale));
      if (rotations[index]) {
        cube.rotation.copy(rotations[index]);
      }
      torusGroup.add(cube); // Añadir el cubo al grupo
    });

    torusGroup.rotation.set(...currentStargate.rotate); // Aplicar rotación al grupo
    torusGroup.position.copy(currentStargate.position);
    collisionObjects.push(torusGroup); // Añadir el grupo a la lista de objetos de colisión
  }

  const positions2 = [
    new THREE.Vector3(0.2, 23, 2.9),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-28, -3, 23),
    new THREE.Vector3(28, 2.5, -23),
    new THREE.Vector3(23, -3.8, 28),
    new THREE.Vector3(-23, 3.4, -28),
    new THREE.Vector3(0, 4.8, -36),
    new THREE.Vector3(0, -4.8, 36),
    new THREE.Vector3(36, -0, 0),
    new THREE.Vector3(-36, -0, 0),
    new THREE.Vector3(-0.1, -43, -5.9),
    new THREE.Vector3(-0.1, -16.5, -2.9),
    new THREE.Vector3(0.2, 12, 1.7),

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
    new THREE.Vector3(10, 200, 10),
    new THREE.Vector3(120, 80, 120),
    new THREE.Vector3(250, 30, 250),
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
    new THREE.Vector3(30, 45, 30),
  ];


  positions2.forEach((position, index) => {
    const cubeGeometry = new THREE.BoxGeometry(scales2[index].x, scales2[index].y, scales2[index].z);
    const cube = new THREE.Mesh(cubeGeometry, materialColision);
    cube.position.copy(position.multiplyScalar(currentStargate.scale));
    if (rotations2[index]) {
      cube.rotation.copy(rotations2[index]);
    }
    spaceStationGroup.add(cube); // Añadir el cubo al grupo
  });

  //spaceStationGroup.rotation.set(new THREE.Vector3(0, -Math.PI, 0)); // Aplicar rotación al grupo
  spaceStationGroup.position.copy(new THREE.Vector3(0, -10, -800));
  collisionObjects.push(spaceStationGroup); // Añadir el grupo a la lista de objetos de colisión


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
        camera={{ far: 10000 }}>

        {collisionObjects.map((obj, index) => (
          <primitive key={index} object={obj} />
        ))}

        <CameraController spaceShipRef={spaceShipRef} collisionObjects={collisionObjects} nextGate={nextGate} nMax={stargates.length}
          puntoControlRef={puntoControlRef} typeCamera={typeCamera} setIsForward={setIsForward} setIsRight={setIsRight} setIsLeft={setIsLeft}
          setIsUp={setIsUp} setIsDown={setIsDown} setIsClockwise={setIsClockwise} setIsCounterClockwise={setIsCounterClockwise} isForward={isForward}
          isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise} />
        <Environment
          background={true} // can be true, false or "only" (which only sets the background) (default: false)
          blur={0.01} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
          files={[
            'right.png', // px
            'left.png',  // nx
            'top.png',   // py
            'bot.png',   // ny
            'front.png', // pz
            'back.png'   // nz
          ]}
          path="/Spaceship-Controller/bkg/lightblue/"
          preset={null}
          scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
          encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
        />
        <Bvh firstHitOnly>
          <SpaceStation ref={spaceStationRef} scale={30} position={[0, -10, -800]} rotation={[0, -Math.PI, 0]} />

          <RusticSpaceShip position={[0, 2, 5]} ref={spaceShipRef} isForward={isForward}
            isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise} />

          {currentStargate && (
            <Circle
              args={[3, 32, 0, Math.PI * 2]}
              ref={puntoControlRef}
              rotation={currentStargate.rotate}
              position={currentStargate.position}
              scale={currentStargate.scale / 2.99}
              material={materialStargateCurrent}
            />
          )}
          {currentStargate && (
            <Stargate
              position={currentStargate.position}
              scale={currentStargate.scale / 2.99}
              rotation={currentStargate.rotate}
              isEmissive={currentStargate.orden == stargateCurrent}
            />
          )}

        </Bvh>


        <directionalLight intensity={5} color={0x8888ff} position={[0, 0, 500]} />
        <directionalLight intensity={5} color={0x8888ff} position={[0, 0, -500]} />

      </Canvas>
    </section>

  )
}

export default Home