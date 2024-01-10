import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';


const CameraController = ({ setCameraDirection, setCameraUp, spaceShipRef }) => {
  const { camera } = useThree();
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const [rotationSpeed, setRotationSpeed] = useState({ x: 0, y: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState({ x: 0, y: 0, z: 0 });

  const currentMovementSpeed = useRef(0);
  const movementAcceleration = 0.005;
  const maxMovementSpeed = 1;

  useFrame(() => {
    // Ajustar la velocidad de rotación y movimiento
    const delta = 0.1; // Factor de aceleración/desaceleración
    rotationSpeed.x += (targetRotation.x - rotationSpeed.x) * delta;
    rotationSpeed.y += (targetRotation.y - rotationSpeed.y) * delta;
    rotationSpeed.z += (targetRotation.z - rotationSpeed.z) * delta;


    // Aplicar la rotación y el movimiento a la cámara

    camera.rotateX(rotationSpeed.x);
    camera.rotateY(rotationSpeed.y);
    camera.rotateZ(rotationSpeed.z);
    // Asegúrate de que el objeto 3D exista antes de intentar manipularlo

    spaceShipRef.current.rotation.x = camera.rotation.x;
    spaceShipRef.current.rotation.y = camera.rotation.y;
    spaceShipRef.current.rotation.z = camera.rotation.z;

    // Actualizar la dirección y el arriba de la cámara
    const dir = new THREE.Vector3();
    const up = new THREE.Vector3();
    camera.getWorldDirection(dir);

    if (moveForward.current) {
      currentMovementSpeed.current = Math.min(currentMovementSpeed.current + movementAcceleration, maxMovementSpeed);
    } else if (moveBackward.current) {
      currentMovementSpeed.current = Math.max(currentMovementSpeed.current - movementAcceleration, -maxMovementSpeed);
    } else {
      currentMovementSpeed.current *= 0.97; // Desacelerar
    }
    camera.position.addScaledVector(dir, currentMovementSpeed.current);
    camera.getWorldDirection(dir);
    const pos = new THREE.Vector3();
    camera.getWorldPosition(pos);

    spaceShipRef.current.position.set(pos.x + dir.x * 1, pos.y + dir.y * 1, pos.z + dir.z * 1);

    up.copy(camera.up).applyQuaternion(camera.quaternion);
    setCameraDirection(dir.toArray().map(d => d.toFixed(2)).join(', '));
    setCameraUp(up.toArray().map(u => u.toFixed(2)).join(', '));
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
      case ' ': // Mover hacia adelante
        moveForward.current = true;
        break;
      case 'Shift': // Mover hacia atrás
        moveBackward.current = true;
        break;
    }
  };

  const handleKeyUp = (event) => {
    setTargetRotation({ x: 0, y: 0, z: 0 });

    switch (event.key) {
      case ' ':
        moveForward.current = false;
        break;
      case 'Shift':
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

