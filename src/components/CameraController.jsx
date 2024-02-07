
import { useThree, useFrame } from '@react-three/fiber';
import { OBB } from '../utils/OBB.js';
import EngineSoundController from '../components/EngineSoundController.jsx';
import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react';


const CameraController = ({ spaceShipRef, typeCamera, collisionObjects, nextGate, puntoControlRef, nMax, setIsForward,
  setIsRight, setIsLeft, setIsUp, setIsDown, setIsClockwise, setIsCounterClockwise, isForward,
  isLeft, isRight, isUp, isDown, isClockwise, isCounterClockwise, currentMovementSpeed, setCurrentMovementSpeed }) => {


  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const [rotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });

  const movementAcceleration = 0.006;
  const maxMovementSpeed = 0.4;
  const zoomCamera = 5;

  // Función para detectar colisiones y devolver el objeto de colisión
  const detectCollision = (nextPosition) => {
    const shipBoundingBox = new THREE.Box3().setFromObject(spaceShipRef.current);
    const nextBoundingBox = shipBoundingBox.clone().translate(nextPosition);

    let obj = collisionObjects.spaceStationGroup;

    if (obj != null) {
      for (let child of obj.children) {
        child.geometry.computeBoundingBox();
        child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
        child.userData.obb.applyMatrix4(child.matrixWorld);
        if (child.userData.obb.intersectsBox3(nextBoundingBox))
          return child;
      }
    }

    obj = collisionObjects.torusGroup;

    if (obj != null) {
      for (let child of obj.children) {
        child.geometry.computeBoundingBox();
        child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
        child.userData.obb.applyMatrix4(child.matrixWorld);
        if (child.userData.obb.intersectsBox3(nextBoundingBox))
          return child;
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
      setCurrentMovementSpeed(current => {
        return current > 0 ? current + 0.5 : current - 0.5;
      });
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
    if (event.key.toUpperCase() == 'S') {
      setIsDown(true);
    }
    if (event.key.toUpperCase() == 'W') {
      setIsUp(true);
    }
    if (event.key.toUpperCase() == 'A') {
      setIsLeft(true);
    }
    if (event.key.toUpperCase() == 'D') {
      setIsRight(true);
    }
    if (event.key.toUpperCase() == 'E') {
      setIsClockwise(true);
    }
    if (event.key.toUpperCase() == 'Q') {
      setIsCounterClockwise(true);
    }
    if (event.key.toUpperCase() == 'SHIFT') {
      moveForward.current = true;
    }
    if (event.key.toUpperCase() == ' ') {
      moveBackward.current = true;
      setIsForward(true);
    }
  };

  const handleKeyUp = (event) => {
    setTargetRotation({ x: 0, y: 0, z: 0 });
    if (event.key.toUpperCase() == 'S') {
      setIsDown(false);
    }
    if (event.key.toUpperCase() == 'W') {
      setIsUp(false);
    }
    if (event.key.toUpperCase() == 'A') {
      setIsLeft(false);
    }
    if (event.key.toUpperCase() == 'D') {
      setIsRight(false);
    }
    if (event.key.toUpperCase() == 'E') {
      setIsClockwise(false);
    }
    if (event.key.toUpperCase() == 'Q') {
      setIsCounterClockwise(false);
    }
    if (event.key.toUpperCase() == 'SHIFT') {
      moveForward.current = false;
    }
    if (event.key.toUpperCase() == ' ') {
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

export default CameraController;