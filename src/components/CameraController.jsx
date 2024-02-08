
import { useThree, useFrame } from '@react-three/fiber';
import { OBB } from '../utils/OBB.js';
import EngineSoundController from '../components/EngineSoundController.jsx';
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react';
import AmbientSoundController from './AmbientSoundController.jsx';
import PressureSoundController from './PressureSoundController.jsx';


const CameraController = ({ spaceShipRef, collisionObjects, nextGate, puntoControlRef, nMax, setIsForward, isForward, isBackward,
  isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise, currentMovementSpeed, setCurrentMovementSpeed,
  targetRotation, setTargetRotation, playHit, playBoost }) => {

  const cubeRef = useRef();
  const [controlPointCC, setControlPointCC] = useState(true);

  const { camera } = useThree();
  const [rotationSpeed] = useState({ x: 0, y: 0, z: 0 });

  const movementAcceleration = 0.006;
  const maxMovementSpeed = 0.4;
  const zoomCamera = 5;



  // Función para detectar colisiones y devolver el objeto de colisión
  const detectCollision = (nextPosition) => {
    cubeRef.current.geometry.computeBoundingBox();
    const nextBoundingBox = new OBB().fromBox3(cubeRef.current.geometry.boundingBox);
    nextBoundingBox.applyMatrix4(cubeRef.current.matrixWorld);

    let obj = collisionObjects.spaceStationGroup;

    if (obj != null) {
      for (let child of obj.children) {
        child.geometry.computeBoundingBox();
        child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
        child.userData.obb.applyMatrix4(child.matrixWorld);
        if (child.userData.obb.intersectsOBB(nextBoundingBox))
          return child;
      }
    }

    obj = collisionObjects.torusGroup;

    if (obj != null) {
      for (let child of obj.children) {
        child.geometry.computeBoundingBox();
        child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
        child.userData.obb.applyMatrix4(child.matrixWorld);
        if (child.userData.obb.intersectsOBB(nextBoundingBox))
          return child;
      }
    }

    return null;
  };
  const detectControlPointCollision = (spaceShipRef, puntoControlRef, nextGate) => {
    cubeRef.current.geometry.computeBoundingBox();
    const shipBoundingBox = new OBB().fromBox3(cubeRef.current.geometry.boundingBox);
    shipBoundingBox.applyMatrix4(cubeRef.current.matrixWorld);

    puntoControlRef.current.geometry.computeBoundingBox();
    const controlPointBoundingBox = new OBB().fromBox3(puntoControlRef.current.geometry.boundingBox);
    controlPointBoundingBox.applyMatrix4(puntoControlRef.current.matrixWorld);

    if (shipBoundingBox.intersectsOBB(controlPointBoundingBox) && controlPointCC && cubeRef.current.position.z < -15) {
      // Si hay colisión, incrementa stargateCurrent
      playBoost();
      nextGate(nMax);
      setControlPointCC(false);
      setCurrentMovementSpeed(current => {
        return current > 0 ? current + 0.5 : current - 0.5;
      });
      setTimeout(() => {
        setControlPointCC(true);
      }, 800);
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

      if (isBackward) {
        setCurrentMovementSpeed(Math.min(currentMovementSpeed + movementAcceleration, maxMovementSpeed));
      } else if (isForward) {
        setCurrentMovementSpeed(Math.max(currentMovementSpeed - movementAcceleration, -maxMovementSpeed));
      } else {
        setCurrentMovementSpeed(currentMovementSpeed * 0.97); // Desacelerar
      }

    } else {
      // Calcular el vector desde la nave al objeto de colisión
      const collisionVector = new THREE.Vector3();
      collisionVector.subVectors(objCol.position, spaceShipRef.current.position);

      if (Math.abs(currentMovementSpeed) > maxMovementSpeed / 2) {
        playHit();
      }
      setCurrentMovementSpeed(0);

      // Calcular el ángulo
      let angle = 0;
      if (isBackward) {
        angle = dir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      } else if (isForward) {
        const rdir = dir.multiplyScalar(-1);
        angle = rdir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      }

      // Si el ángulo está cerca de 90 grados, permite el movimiento
      if (angle > 90) {
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
    const down = new THREE.Vector3(0, -1, 0);
    down.applyQuaternion(spaceShipRef.current.quaternion);


    // Calcula la base de la nueva posición de la cámara.
    const baseX = pos.x + 0.02 + dir.x * ((zoomCamera + currentMovementSpeed * 3) / 4);
    const baseY = pos.y + 0.02 + dir.y * ((zoomCamera + currentMovementSpeed * 2) / 4);
    const baseZ = pos.z + 0.02 + dir.z * ((zoomCamera + currentMovementSpeed * 2.5) / 4);

    // Define la intensidad del shake. Puedes ajustar estos valores.
    const shakeIntensity = currentMovementSpeed * 0.01;

    // Genera valores aleatorios para el shake.
    const shakeX = (Math.random() - 0.5) * shakeIntensity;
    const shakeY = (Math.random() - 0.5) * shakeIntensity;
    const shakeZ = (Math.random() - 0.5) * shakeIntensity;

    // Aplica la posición con el efecto de shake.
    camera.position.set(baseX + shakeX, baseY + shakeY, baseZ + shakeZ);


    // Asegúrate de que tanto spaceShipRef como cubeRef estén definidos
    if (spaceShipRef.current && cubeRef.current) {
      // Actualizar posición del cubo para que coincida con la de la nave espacial
      const scaledDown = down.multiplyScalar(0.33);
      const newPos = pos.add(scaledDown);
      const newPos2 = newPos.add(dir.multiplyScalar(0.075));

      cubeRef.current.position.set(newPos2.x, newPos2.y, newPos2.z);

      // Actualizar rotación del cubo para que coincida con la de la nave espacial
      cubeRef.current.rotation.copy(spaceShipRef.current.rotation);
    }
  });

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

  const [conditions, setConditions] = useState([false, false, false, false, false, false]);

  useEffect(() => {
    updateRotation(0.02);
    setConditions([isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise]);

  }, [isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise]);

  return (
    <>
      <mesh ref={cubeRef} visible={false} position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.25, 0.85]} />
        <meshStandardMaterial color={0x0000ff} transparent opacity={0.0} />
      </mesh>
      <EngineSoundController
        isForward={isForward}
        currentMovementSpeed={currentMovementSpeed}
        maxMovementSpeed={maxMovementSpeed}
      />

      <AmbientSoundController
        isPlaying={true}
      />
      <PressureSoundController conditions={conditions} />

    </>
  );
};

export default CameraController;