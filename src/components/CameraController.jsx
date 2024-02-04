/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OBB } from '../utils/OBB.js';
import EngineSoundController from './EngineSoundController.jsx';



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
    // Crear un nuevo Box3 para calcular el boundingBox del grupo

    const shipBoundingBox = new THREE.Box3().setFromObject(spaceShipRef.current);
    const nextBoundingBox = shipBoundingBox.clone().translate(nextPosition);

    for (let i = 0; i < collisionObjects.length; i++) {
      const obj = collisionObjects[i];

      // Cálculo similar para los objetos en collisionObjects
      if (obj instanceof THREE.Mesh) {
        if (!obj.geometry.boundingBox) {
          obj.geometry.computeBoundingBox();
        }
        obj.userData.obb = new OBB().fromBox3(obj.geometry.boundingBox);
        obj.userData.obb.applyMatrix4(obj.matrixWorld);

        // Comprobar colisión
        if (obj.userData.obb.intersectsBox3(nextBoundingBox)) {
          return obj;
        }
      } else if (obj instanceof THREE.Group) {
        for (let child of obj.children) {
          if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
          child.userData.obb = new OBB().fromBox3(child.geometry.boundingBox);
          child.userData.obb.applyMatrix4(child.matrixWorld);

          // Comprobar colisión
          if (child.userData.obb.intersectsBox3(nextBoundingBox)) {
            return child;
          }
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


    // Asegúrate de que el objeto 3D exista antes de intentar manipularlo

    spaceShipRef.current.rotateX(rotationSpeed.x);
    spaceShipRef.current.rotateY(rotationSpeed.y);
    spaceShipRef.current.rotateZ(rotationSpeed.z);


    // Aplicar la rotación y el movimiento a la cámara
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

      spaceShipRef.current.position.addScaledVector(dir, currentMovementSpeed);

      if (moveForward.current) {
        setCurrentMovementSpeed(Math.min(currentMovementSpeed + movementAcceleration, maxMovementSpeed));
      } else if (moveBackward.current) {
        setCurrentMovementSpeed(Math.max(currentMovementSpeed - movementAcceleration, -maxMovementSpeed));
      } else {
        setCurrentMovementSpeed(currentMovementSpeed * 0.97); // Desacelerar
      }
      spaceShipRef.current.position.addScaledVector(dir, currentMovementSpeed);

    } else {
      // Calcular el vector desde la nave al objeto de colisión
      const collisionVector = new THREE.Vector3();
      collisionVector.subVectors(objCol.position, spaceShipRef.current.position);

      // Calcular el ángulo
      let angle = 0;
      if (moveForward.current) {
        angle = dir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      } else if (moveBackward.current) {
        const rdir = dir.multiplyScalar(-1);
        angle = rdir.angleTo(collisionVector) * (180 / Math.PI); // Convertir a grados
      }

      // Si el ángulo está cerca de 90 grados, permite el movimiento
      if (Math.abs(angle) > 90) {
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
    if (event.key == 'q' || event.key == 'Q') {
      setIsClockwise(true);
    }
    if (event.key == 'e' || event.key == 'E') {
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
    if (event.key == 'q' || event.key == 'Q') {
      setIsClockwise(false);
    }
    if (event.key == 'e' || event.key == 'E') {
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
    <EngineSoundController
      isForward={isForward}
      currentMovementSpeed={currentMovementSpeed}
      maxMovementSpeed={maxMovementSpeed}
    />
  );
};

export default CameraController;