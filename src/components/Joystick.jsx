import React, { useState, useEffect, useRef } from 'react';

const Joystick = ({ setIsUp, setIsDown, setIsRight, setIsLeft, setTargetRotation }) => {
  const [stickPosition, setStickPosition] = useState({ x: 50, y: 50 });
  const joystickRef = useRef(null); // Ref para el contenedor del joystick

  useEffect(() => {
    const joystick = joystickRef.current;
    if (!joystick) return;

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const joystickBase = joystickRef.current.getBoundingClientRect();
      const centerX = joystickBase.left + joystickBase.width / 2;
      const centerY = joystickBase.top + joystickBase.height / 2;
      const touchX = touch.clientX;
      const touchY = touch.clientY;
      const diffX = touchX - centerX;
      const diffY = touchY - centerY;
      const distance = Math.sqrt(diffX * diffX + diffY * diffY);
      const radius = joystickBase.width / 2;
      const angle = Math.atan2(diffY, diffX);
      const limitX = Math.cos(angle) * (radius * (distance > radius ? 1 : distance / radius)) + centerX;
      const limitY = Math.sin(angle) * (radius * (distance > radius ? 1 : distance / radius)) + centerY;

      const newPosition = {
        x: ((limitX - joystickBase.left) / joystickBase.width) * 100,
        y: ((limitY - joystickBase.top) / joystickBase.height) * 100,
      };

      setStickPosition(newPosition);

      // Actualizar estados de dirección basados en la posición del joystick
      setIsUp(newPosition.y < 50);
      setIsDown(newPosition.y > 50);
      setIsLeft(newPosition.x < 50);
      setIsRight(newPosition.x > 50);
    };



    // Agregar el event listener
    joystick.addEventListener('touchmove', handleTouchMove, { passive: false });

    // Limpiar el event listener al desmontar el componente
    return () => {
      joystick.removeEventListener('touchmove', handleTouchMove);
    };
  }, [setIsUp, setIsDown, setIsLeft, setIsRight]);

  return (
    <div
      ref={joystickRef}
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '100px',
        height: '100px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onTouchEnd={() => {
        setStickPosition({ x: 50, y: 50 }); // Centrar el stick
        // Resetear estados de dirección
        setIsUp(false);
        setIsDown(false);
        setIsLeft(false);
        setIsRight(false);
        setTargetRotation({ x: 0, y: 0, z: 0 });
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#2b77e7',
          borderRadius: '50%',
          transform: `translate(${stickPosition.x - 50}%, ${stickPosition.y - 50}%)`,
        }}
      >
      </div>
    </div>
  );
};

export default Joystick;
