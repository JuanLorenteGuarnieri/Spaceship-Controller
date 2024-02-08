/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 public/engine.glb -t -r public 
Author: lowerbadger (https://sketchfab.com/lowerbadger)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/simple-engine-plume-test-792866451d30414080ed52070818dc51
Title: Simple Engine Plume Test
*/

import * as THREE from 'three'
import React, { useRef, forwardRef, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { GroupProps } from '@react-three/fiber'
import { GLTF } from 'three-stdlib'
import { Group } from 'three';

type GLTFResult = GLTF & {
  nodes: {
    Object_6: THREE.Mesh
    Object_4: THREE.Mesh
  }
  materials: {
    Plume2: THREE.MeshStandardMaterial
    Plume1: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

type ActionName = 'Action'
interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}
type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

type EngineProps = JSX.IntrinsicElements['group'] & {
  // Aquí puedes añadir cualquier otra prop personalizada si es necesario
};


export const Engine = forwardRef<Group, EngineProps>((props, ref) => {
  const group = useRef<THREE.Group>(null)
  const { nodes, materials, animations } = useGLTF('models/engine.glb') as GLTFResult
  const { actions } = useAnimations(animations, group)
  const position: [number, number, number] = [0, 0, 0];
  const rotation: [number, number, number] = [0, 0, 0];
  const scale = 1;

  // useEffect(() => {
  //   // Verificar si la acción 'Action' existe
  //   if (actions && 'Action' in actions) {
  //     const action = actions.Action;

  //     if (action) {
  //       action.play();
  //       action.setLoop(THREE.LoopRepeat, Infinity);
  //       action.timeScale = 0.2; // Cambia este valor para controlar la velocidad

  //     }
  //   }
  // }, [actions]);

  useEffect(() => {
    // Ajustar la saturación de los materiales
    Object.values(materials).forEach(material => {
      if (material.isMeshStandardMaterial) {
        const hsl = { h: 0, s: 0, l: 0 };
        material.color.getHSL(hsl);
        material.color.setHSL(hsl.h, 255, hsl.l); // Ajusta el segundo parámetro para cambiar la saturación
      }
    });

    // Código para reproducir la animación...
  }, [actions, materials]);

  return (
    <group ref={ref} {...props} rotation={rotation} scale={scale} position={position} dispose={null}>
      <group ref={group} name="Sketchfab_Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Cylinder465_3" rotation={[Math.PI / 2, 0, -0.15]}>
                <group name="Cylinder466_2">
                  <mesh name="Object_6" geometry={nodes.Object_6.geometry} material={materials.Plume2} />
                </group>
                <mesh name="Object_4" geometry={nodes.Object_4.geometry} material={materials.Plume1} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  )
});

useGLTF.preload('models/engine.glb')