import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

const InitCameraController = ({ spaceShipRef }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (spaceShipRef.current) {
      // Configuración inicial de la posición y rotación de la nave
      spaceShipRef.current.position.subVectors(new Vector3(101, 30, -950), new Vector3(0, 0, 0));
      spaceShipRef.current.rotation.set(0, Math.PI / 2, 0);
    }
    if (camera) {
      camera.lookAt(spaceShipRef.current.position); // Asegura que la cámara mire hacia la nave
    }
  }, [spaceShipRef, camera]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Radio de la rotación alrededor de la nave
    const radius = 1; // Ajusta según la distancia deseada de la nave
    // Calcula las nuevas posiciones X y Z de la cámara para rotar alrededor de la nave
    const x = Math.sin(time / 2) * radius + spaceShipRef.current.position.x;
    const z = Math.cos(time / 2) * radius + spaceShipRef.current.position.z;
    const y = 0.2 + spaceShipRef.current.position.y;

    // Actualiza la posición de la cámara
    if (camera) {
      camera.position.set(x, y, z);
      camera.lookAt(spaceShipRef.current.position); // Asegura que la cámara siempre mire hacia la nave
    }
  });

  return null;
}

export default InitCameraController;
