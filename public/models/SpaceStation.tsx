/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/space_station.glb -t -r public 
Author: re1monsen (https://sketchfab.com/re1monsen)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/space-station-0da4a24e7edd49159737675ffcc06228
Title: Space Station
*/

import * as THREE from 'three'
import React, { useRef, forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import { GLTF } from 'three-stdlib'
import { Group } from 'three';

type GLTFResult = GLTF & {
  nodes: {
    spacestation001_low_Main_0: THREE.Mesh
    spacestation002_low_Main_0: THREE.Mesh
    spacestation003_low_Main_0: THREE.Mesh
    spacestation004_low_Main_0: THREE.Mesh
    spacestation005_low_Main_0: THREE.Mesh
    spacestation006_low_Main_0: THREE.Mesh
    spacestation007_low_Main_0: THREE.Mesh
    spacestation008_low_Main_0: THREE.Mesh
    spacestation009_low_Main_0: THREE.Mesh
    spacestation010_low_Main_0: THREE.Mesh
    spacestation011_low_Main_0: THREE.Mesh
    spacestation012_low_Main_0: THREE.Mesh
    spacestation013_low_Main_0: THREE.Mesh
    spacestation014_low_Main_0: THREE.Mesh
    spacestation015_low_Main_0: THREE.Mesh
    spacestation016_low_Main_0: THREE.Mesh
    spacestation017_low_Main_0: THREE.Mesh
    spacestation018_low_Main_0: THREE.Mesh
    spacestation019_low_Main_0: THREE.Mesh
    spacestation020_low_Main_0: THREE.Mesh
    spacestation021_low_Main_0: THREE.Mesh
    spacestation022_low_Main_0: THREE.Mesh
    spacestation023_low_Main_0: THREE.Mesh
    spacestation024_low_Main_0: THREE.Mesh
    spacestation025_low_Main_0: THREE.Mesh
    spacestation026_low_Main_0: THREE.Mesh
    spacestation027_low_Main_0: THREE.Mesh
    spacestation029_low_Main_0: THREE.Mesh
    spacestation030_low_Main_0: THREE.Mesh
    spacestation031_low_Main_0: THREE.Mesh
    spacestation032_low_Main_0: THREE.Mesh
    spacestation033_low_Main_0: THREE.Mesh
    spacestation034_low_Main_0: THREE.Mesh
    spacestation_low_Main_0: THREE.Mesh
    emit_low001_emitrED_0: THREE.Mesh
    emit_low_emitrED_0: THREE.Mesh
    emit_low002_emitrED_0: THREE.Mesh
  }
  materials: {
    Main: THREE.MeshStandardMaterial
    emitrED: THREE.MeshStandardMaterial
  }
}

type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

type SpaceStationProps = JSX.IntrinsicElements['group'] & {
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
};

export const SpaceStation = forwardRef<Group, SpaceStationProps>(({ scale, position, rotation }, ref) => {
  const { nodes, materials } = useGLTF('models/space_station.glb') as GLTFResult
  return (
    <group ref={ref} scale={scale} position={position} dispose={null}>
      <group rotation={[Math.PI / 2 - 1.446, -0.1, -0.003]} scale={0.01191}>
        <mesh geometry={nodes.spacestation001_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation002_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation003_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation004_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation005_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation006_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation007_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation008_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation009_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation010_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation011_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation012_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation013_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation014_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation015_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation016_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation017_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation018_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation019_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation020_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation021_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation022_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation023_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation024_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation025_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation026_low_Main_0.geometry} material={materials.Main} position={[-658.787, -427.535, -105.87]} rotation={[-1.555, -0.003, 1.343]} scale={100} />
        <mesh geometry={nodes.spacestation027_low_Main_0.geometry} material={materials.Main} position={[334.658, -47.48, -855.527]} rotation={[-Math.PI / 2, 0, -1.774]} scale={100} />
        <mesh geometry={nodes.spacestation029_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation030_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation031_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation032_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation033_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation034_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.spacestation_low_Main_0.geometry} material={materials.Main} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
        <mesh geometry={nodes.emit_low001_emitrED_0.geometry} material={materials.emitrED} position={[-658.787, -427.535, -105.87]} rotation={[-1.555, -0.003, 1.343]} scale={100} />
        <mesh geometry={nodes.emit_low_emitrED_0.geometry} material={materials.emitrED} position={[334.658, -47.48, -855.527]} rotation={[-Math.PI / 2, 0, -1.774]} scale={100} />
        <mesh geometry={nodes.emit_low002_emitrED_0.geometry} material={materials.emitrED} rotation={[-Math.PI / 2, 0, 0]} scale={100} />
      </group>
    </group>
  )
});

useGLTF.preload('models/space_station.glb')
