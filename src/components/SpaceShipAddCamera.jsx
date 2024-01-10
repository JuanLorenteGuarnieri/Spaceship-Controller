import React, { forwardRef, useEffect, useRef } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Desk } from '../models/Desk';

const SpaceShipAddCamera = ({ modelRef }) => {
  const { camera } = useThree();

  useEffect(() => {
    if (modelRef.current) {
      camera.add(modelRef.current);
    }

    return () => {
      if (modelRef.current) {
        camera.remove(modelRef.current);
      }
    };
  }, [modelRef, camera]);

  return <Desk ref={modelRef} />;
};

export default SpaceShipAddCamera;
