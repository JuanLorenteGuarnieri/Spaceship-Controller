import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Bvh, Circle, Html } from '@react-three/drei'
import { RusticSpaceShip } from '../../public/models/RusticSpaceShip';
import { SpaceStation } from '../../public/models/SpaceStation';
import * as THREE from 'three'
import { Stargate } from '../../public/models/Stargate';

import { useThree, useFrame } from '@react-three/fiber';
import { OBB } from '../utils/OBB.js';
import EngineSoundController from '../components/EngineSoundController.jsx';



const CameraController = ({ spaceShipRef, typeCamera, collisionObjects, nextGate, puntoControlRef, nMax, setIsForward,
  setIsRight, setIsLeft, setIsUp, setIsDown, setIsClockwise, setIsCounterClockwise, isForward,
  isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise }) => {


  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const [rotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });

  const [currentMovementSpeed, setCurrentMovementSpeed] = useState(0);
  const movementAcceleration = 0.003;
  const maxMovementSpeed = 0.4;
  const zoomCamera = 5;

  // Función para detectar colisiones y devolver el objeto de colisión
  const detectCollision = (nextPosition) => {
    const shipBoundingBox = new THREE.Box3().setFromObject(spaceShipRef.current);
    const nextBoundingBox = shipBoundingBox.clone().translate(nextPosition);

    for (let i = 0; i < collisionObjects.length; i++) {
      const obj = collisionObjects[i];
      if (obj instanceof THREE.Mesh) {
        obj.geometry.computeBoundingBox();
        obj.userData.obb = new OBB().fromBox3(obj.geometry.boundingBox);
        obj.userData.obb.applyMatrix4(obj.matrixWorld);
        if (obj.userData.obb.intersectsBox3(nextBoundingBox))
          return obj;
      } else if (obj instanceof THREE.Group) {
        for (let child of obj.children) {
          child.geometry.computeBoundingBox();
          child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
          child.userData.obb.applyMatrix4(child.matrixWorld);
          if (child.userData.obb.intersectsBox3(nextBoundingBox))
            return child;
        }
      }
    }

    return null;
  };

  const detectControlPointCollision = (spaceShipRef, puntoControlRef, nextGate) => {
    const shipBoundingBox = new THREE.Box3().setFromObject(spaceShipRef.current);
    const controlPointBoundingBox = new THREE.Box3().setFromObject(puntoControlRef.current);

    if (shipBoundingBox.intersectsBox(controlPointBoundingBox)) {
      // Si hay colisión, incrementa stargateCurrent
      nextGate(nMax);
    }
  };


  const lastSafePosition = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    // Ajustar la velocidad de rotación y movimiento
    const rotationAdjustment = delta * 2; // Ajuste de la velocidad de rotación

    rotationSpeed.x += (targetRotation.x - rotationSpeed.x) * rotationAdjustment;
    rotationSpeed.y += (targetRotation.y - rotationSpeed.y) * rotationAdjustment;
    rotationSpeed.z += (targetRotation.z - rotationSpeed.z) * rotationAdjustment;

    spaceShipRef.current.rotateX(rotationSpeed.x);
    spaceShipRef.current.rotateY(rotationSpeed.y);
    spaceShipRef.current.rotateZ(rotationSpeed.z);

    camera.rotation.x = spaceShipRef.current.rotation.x;
    camera.rotation.y = spaceShipRef.current.rotation.y;
    camera.rotation.z = spaceShipRef.current.rotation.z;

    const dir = new THREE.Vector3();
    spaceShipRef.current.getWorldDirection(dir);

    // Calcular la próxima posición propuesta
    const nextPosition = dir.clone().multiplyScalar(currentMovementSpeed);
    const objCol = detectCollision(nextPosition);
    if (objCol == null) {
      lastSafePosition.current.copy(spaceShipRef.current.position);

      spaceShipRef.current.position.addScaledVector(dir, currentMovementSpeed * 2);

      if (moveForward.current) {
        setCurrentMovementSpeed(Math.min(currentMovementSpeed + movementAcceleration, maxMovementSpeed));
      } else if (moveBackward.current) {
        setCurrentMovementSpeed(Math.max(currentMovementSpeed - movementAcceleration, -maxMovementSpeed));
      } else {
        setCurrentMovementSpeed(currentMovementSpeed * 0.97); // Desacelerar
      }

    } else {
      console.log("CHOCASTE con");
      console.log(objCol);
      // Calcular el vector desde la nave al objeto de colisión
      const collisionVector = new THREE.Vector3();
      collisionVector.subVectors(objCol.position, spaceShipRef.current.position);
      setCurrentMovementSpeed(0);

      // Calcular el ángulo
      let angle = 0;
      if (moveForward.current) {
        angle = dir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      } else if (moveBackward.current) {
        const rdir = dir.multiplyScalar(-1);
        angle = rdir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      }

      // Si el ángulo está cerca de 90 grados, permite el movimiento
      if (Math.abs(angle) > 115) {
        // Permite moverse
        setCurrentMovementSpeed(Math.min(currentMovementSpeed + movementAcceleration, maxMovementSpeed));
        spaceShipRef.current.position.addScaledVector(dir, currentMovementSpeed);
        lastSafePosition.current.copy(spaceShipRef.current.position);

      } else {
        // En caso de colisión no permitida, revertir a la última posición segura
        spaceShipRef.current.position.copy(lastSafePosition.current);
        setCurrentMovementSpeed(0);
      }
    }

    //comprobar punto de control
    if (puntoControlRef.current && spaceShipRef.current) {
      detectControlPointCollision(spaceShipRef, puntoControlRef, nextGate);
    }

    //Posicion camara
    spaceShipRef.current.getWorldDirection(dir);
    const pos = new THREE.Vector3();
    spaceShipRef.current.getWorldPosition(pos);

    if (typeCamera == "1P") {
      camera.position.set(pos.x + 0.02 - dir.x * ((zoomCamera + currentMovementSpeed * 3) / 4), pos.y + 0.02 - dir.y * ((zoomCamera + currentMovementSpeed * 2) / 4), pos.z + 0.02 - dir.z * ((zoomCamera + currentMovementSpeed * 3) / 4));
    } else if (typeCamera == "3P") {
      camera.position.set(pos.x + 0.02 + dir.x * ((zoomCamera + currentMovementSpeed * 3) / 4), pos.y + 0.02 + dir.y * ((zoomCamera + currentMovementSpeed * 2) / 4), pos.z + 0.02 + dir.z * ((zoomCamera + currentMovementSpeed * 2.5) / 4));
    }
  });


  const handleKeyDown = (event) => {
    if (event.key == 's' || event.key == 'S') {
      setIsDown(true);
    }
    if (event.key == 'w' || event.key == 'W') {
      setIsUp(true);
    }
    if (event.key == 'a' || event.key == 'A') {
      setIsLeft(true);
    }
    if (event.key == 'd' || event.key == 'D') {
      setIsRight(true);
    }
    if (event.key == 'e' || event.key == 'E') {
      setIsClockwise(true);
    }
    if (event.key == 'q' || event.key == 'Q') {
      setIsCounterClockwise(true);
    }
    if (event.key == 'Shift') {
      moveForward.current = true;
    }
    if (event.key == ' ') {
      moveBackward.current = true;
      setIsForward(true);
    }
  };

  const handleKeyUp = (event) => {
    setTargetRotation({ x: 0, y: 0, z: 0 });
    if (event.key == 's' || event.key == 'S') {
      setIsDown(false);
    }
    if (event.key == 'w' || event.key == 'W') {
      setIsUp(false);
    }
    if (event.key == 'a' || event.key == 'A') {
      setIsLeft(false);
    }
    if (event.key == 'd' || event.key == 'D') {
      setIsRight(false);
    }
    if (event.key == 'e' || event.key == 'E') {
      setIsClockwise(false);
    }
    if (event.key == 'q' || event.key == 'Q') {
      setIsCounterClockwise(false);
    }
    if (event.key == 'Shift') {
      moveForward.current = false;
    }
    if (event.key == ' ') {
      moveBackward.current = false;
      setIsForward(false);
    }
  };

  function updateRotation(delta) {
    if (isDown) {
      setTargetRotation(r => ({ ...r, x: -1.5 * delta }));
    } else if (isUp) {
      setTargetRotation(r => ({ ...r, x: 1.5 * delta }));
    }
    if (isLeft) {
      setTargetRotation(r => ({ ...r, y: 1.5 * delta }));
    } else if (isRight) {
      setTargetRotation(r => ({ ...r, y: -1.5 * delta }));
    }
    if (isClockwise) {
      setTargetRotation(r => ({ ...r, z: -1.5 * delta }));
    } else if (isCounterClockwise) {
      setTargetRotation(r => ({ ...r, z: 1.5 * delta }));
    }
  }

  useEffect(() => {
    updateRotation(0.02);
  }, [isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise]);

  useEffect(() => {  //add listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  return (
    <></>
    // <EngineSoundController
    //   isForward={isForward}
    //   currentMovementSpeed={currentMovementSpeed}
    //   maxMovementSpeed={maxMovementSpeed}
    // />
  );
};

function Home() {
  const spaceShipRef = useRef();
  const spaceStationRef = useRef();
  const puntoControlRef = useRef();
  const typeCamera = "3P";


  const [stargateCurrent, setStargateCurrent] = useState(1);
  const [isForward, setIsForward] = useState(false);
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

  function nextGate(nMax) {
    setStargateCurrent(current => {
      // Asumiendo que quieres ciclar de vuelta al primer stargate después del último
      const nextIndex = current >= nMax ? 1 : current + 1;

      if (nextIndex === 2) {
        setCounter(0); // Reiniciar contador
        setIsCounting(true); // Iniciar el contador
      }
      // Detener contador si current es igual a nMax
      else if (nextIndex === 1) {
        setIsCounting(false); // Detener el contador
      }
      return nextIndex;
    });
  }

  const materialColision = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.9, transparent: true });
  const materialStargateCurrent = new THREE.MeshBasicMaterial({ color: 0x0000ff, opacity: 0.15, transparent: true });
  materialStargateCurrent.side = THREE.DoubleSide;

  // Definir collisionObjects como un array regular
  let collisionObjects = [];
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
  createStarGate(new THREE.Vector3(-160, 5, -810), 5, [0, -Math.PI / 15, 0]);
  createStarGate(new THREE.Vector3(-130, 5, -870), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-110, -50, -890), 5, [Math.PI / 2, 0.6, 0]);
  createStarGate(new THREE.Vector3(10, -90, -850), 15, [Math.PI / 8, 1.5, 0]);
  createStarGate(new THREE.Vector3(90, -70, -910), 15, [1.4, -0.8, 0]);
  createStarGate(new THREE.Vector3(110, 10, -900), 10, [1.4, 0, 0]);
  createStarGate(new THREE.Vector3(90, 30, -870), 8, [-0.1, -0.4, 0]);
  createStarGate(new THREE.Vector3(60, 35, -830), 5, [-0.1, -0.4, 0]);
  createStarGate(new THREE.Vector3(10, 55, -770), 5, [-0.1, -0.4, 0]);
  createStarGate(new THREE.Vector3(-10, 95, -780), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-10, 170, -780), 5, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(-10, 270, -780), 14, [Math.PI / 2, 0, 0]);
  createStarGate(new THREE.Vector3(0.2, 208, -773.4), 5, [Math.PI / 2, 0, 0]);

  const spaceStationGroup = new THREE.Group(); // Grupo para contener todos los cubos

  if (stargates[stargateCurrent] && spaceShipRef.current && spaceShipRef.current.position.z < -30) {  //añadir colosiones
    // Calcular la distancia entre la nave espacial y el stargate actual
    const distanceToStargate = spaceShipRef.current.position.distanceTo(stargates[stargateCurrent].position);

    // Comprobar si la distancia es menor o igual a dos veces el scale del stargate actual
    if (distanceToStargate <= 2 * stargates[stargateCurrent].scale) {
      positions.forEach((position, index) => {
        const cubeGeometry = new THREE.BoxGeometry(stargates[stargateCurrent].scale / 4, stargates[stargateCurrent].scale, stargates[stargateCurrent].scale / 8);
        const cube = new THREE.Mesh(cubeGeometry, materialColision);
        cube.name = "Stargate Collision part: " + index;
        cube.position.copy(position.multiplyScalar(stargates[stargateCurrent].scale));
        if (rotations[index]) {
          cube.rotation.copy(rotations[index]);
        }
        torusGroup.add(cube); // Añadir el cubo al grupo
      });

      torusGroup.rotation.set(...stargates[stargateCurrent].rotate); // Aplicar rotación al grupo
      torusGroup.position.copy(stargates[stargateCurrent].position);
      collisionObjects.push(torusGroup); // Añadir el grupo a la lista de objetos de colisión

    }
  }

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

  if (spaceShipRef.current && spaceShipRef.current.position.z < -500) {
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
    collisionObjects.push(spaceStationGroup); // Añadir el grupo a la lista de objetos de colisión

  }

  // Efecto para manejar el contador
  useEffect(() => {
    let lastTime = Date.now();

    const animate = () => {
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


  return (
    <section className="w-full h-screen relative">
      {/* <div className='absolute top-28 left-0 right-0 z-10 flex items-center justify-center'>
        <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
          <p> Tiempo: {counter.toFixed(2)}s</p>
        </h1>
      </div>
      <div className='absolute top-50 left-0 right-0 z-10 flex items-center justify-center'>
        <h1 className='sm:text-xl sm:leading-snug text-center neo-brutalism-blue py-4 px-8 text-white mx-5'>
          <p> {stargateCurrent - 1}/{stargates.length - 1}</p>
        </h1>
      </div> */}
      <Canvas className="w-full h-screen bg-transparent" ref={canvasRef}
        camera={{ far: 10000 }}>

        {collisionObjects.map((obj, index) => (
          <primitive key={index} object={obj} />
        ))}

        <CameraController spaceShipRef={spaceShipRef} collisionObjects={collisionObjects} nextGate={nextGate} nMax={stargates.length}
          puntoControlRef={puntoControlRef} typeCamera={typeCamera} setIsForward={setIsForward} setIsRight={setIsRight} setIsLeft={setIsLeft}
          setIsUp={setIsUp} setIsDown={setIsDown} setIsClockwise={setIsClockwise} setIsCounterClockwise={setIsCounterClockwise} isForward={isForward}
          isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise} />
        {/* <Environment
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
        /> */}
        <Bvh firstHitOnly>
          <SpaceStation ref={spaceStationRef} scale={30} position={[0, -10, -800]} rotation={[0, -Math.PI, 0]} />

          <RusticSpaceShip position={[0, 1000, 500]} ref={spaceShipRef} isForward={isForward}
            isLeft={isLeft} isRight={isRight} isUp={isUp} isDown={isDown} isClockwise={isClockwise} isCounterClockwise={isCounterClockwise} />

          {stargates[stargateCurrent] && (
            <Circle
              args={[3, 32, 0, Math.PI * 2]}
              ref={puntoControlRef}
              rotation={stargates[stargateCurrent].rotate}
              position={stargates[stargateCurrent].position}
              scale={stargates[stargateCurrent].scale / 2.99}
              material={materialStargateCurrent}
            />
          )}
          {stargates[stargateCurrent] && (
            <Stargate
              position={stargates[stargateCurrent].position}
              scale={stargates[stargateCurrent].scale / 2.99}
              rotation={stargates[stargateCurrent].rotate}
              isEmissive={true}
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