import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import Loader from '../components/Loader'
import { Desk } from '../models/Desk'
import { ContactShadows, Environment, Float, MapControls } from '@react-three/drei'
import CameraController from '../components/CameraController';
import { RusticSpaceShip } from '../models/RusticSpaceShip';
import { SpaceStation } from '../../SpaceStation';


function Home() {
  const [cameraDirection, setCameraDirection] = useState("0, 0, 0");
  const [cameraUp, setCameraUp] = useState("0, 1, 0");
  const spaceShipRef = useRef();
  const deskRef = useRef();
  const spaceStationRef = useRef();


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
        camera={{ near: 0.1, far: 10000 }}>

        <CameraController spaceShipRef={spaceShipRef} setCameraDirection={setCameraDirection} setCameraUp={setCameraUp} />
        <Environment
          background={true} // can be true, false or "only" (which only sets the background) (default: false)
          blur={0.00} // blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
          files={[
            'right.png', // px
            'left.png',  // nx
            'top.png',   // py
            'bot.png',   // ny
            'front.png', // pz
            'back.png'   // nz
          ]}
          path="/src/assets/bkg/lightblue/"
          preset={null}
          scene={undefined} // adds the ability to pass a custom THREE.Scene, can also be a ref
          encoding={undefined} // adds the ability to pass a custom THREE.TextureEncoding (default: THREE.sRGBEncoding for an array of files and THREE.LinearEncoding for a single texture)
        />


        {/* <Float
          speed={1} // Animation speed, defaults to 1
          rotationIntensity={1} // XYZ rotation intensity, defaults to 1
          floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
          floatingRange={[0, 0.5]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
        >
          <Desk ref={deskRef} />

        </Float> */}
        <SpaceStation ref={spaceStationRef} />

        <RusticSpaceShip ref={spaceShipRef} />


        {/* <SpaceShip modelRef={spaceShipRef} /> */}


      </Canvas>
    </section>

  )
}

export default Home