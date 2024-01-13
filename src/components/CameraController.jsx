import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const CameraController = ({ spaceShipRef, typeCamera }) => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });

  const currentMovementSpeed = useRef(0);
  const movementAcceleration = 0.005;
  const maxMovementSpeed = 1;
  const zoomCamera = 4;

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



    // Actualizar la dirección y el arriba de la cámara
    const dir = new THREE.Vector3();
    spaceShipRef.current.getWorldDirection(dir);

    if (moveForward.current) {
      currentMovementSpeed.current = Math.min(currentMovementSpeed.current + movementAcceleration, maxMovementSpeed);
    } else if (moveBackward.current) {
      currentMovementSpeed.current = Math.max(currentMovementSpeed.current - movementAcceleration, -maxMovementSpeed);
    } else {
      currentMovementSpeed.current *= 0.97; // Desacelerar
    }
    spaceShipRef.current.position.addScaledVector(dir, currentMovementSpeed.current);
    spaceShipRef.current.getWorldDirection(dir);
    const pos = new THREE.Vector3();
    const up = camera.up;
    spaceShipRef.current.getWorldPosition(pos);


    if (typeCamera == "1P") {
      camera.position.set(pos.x + 0.02 - dir.x * (zoomCamera / 4), pos.y + 0.02 - dir.y * (zoomCamera / 4), pos.z + 0.02 - dir.z * (zoomCamera / 4));
    } else if (typeCamera == "3P") {
      camera.position.set(pos.x + 0.02 + dir.x * (zoomCamera / 4), pos.y + 0.02 + dir.y * (zoomCamera / 4), pos.z + 0.02 + dir.z * (zoomCamera / 4));

    }

  });


  const handleKeyDown = (event) => {
    const rotationAmount = 0.02; // Velocidad de rotación base
    switch (event.key) {
      case 's':
        setTargetRotation(r => ({ ...r, x: -rotationAmount }));
        break;
      case 'w':
        setTargetRotation(r => ({ ...r, x: rotationAmount }));
        break;
      case 'a':
        setTargetRotation(r => ({ ...r, y: rotationAmount }));
        break;
      case 'd':
        setTargetRotation(r => ({ ...r, y: -rotationAmount }));
        break;
      case 'q':
        setTargetRotation(r => ({ ...r, z: rotationAmount }));
        break;
      case 'e':
        setTargetRotation(r => ({ ...r, z: -rotationAmount }));
        break;
      case 'Shift': // Mover hacia adelante
        moveForward.current = true;
        break;
      case ' ': // Mover hacia atrás
        moveBackward.current = true;
        break;
    }
  };

  const handleKeyUp = (event) => {
    setTargetRotation({ x: 0, y: 0, z: 0 });

    switch (event.key) {
      case 'Shift':
        moveForward.current = false;
        break;
      case ' ':
        moveBackward.current = false;
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
};

export default CameraController;

