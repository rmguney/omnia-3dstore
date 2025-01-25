'use client'
import { useRef, useState, useMemo } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

export default function Box({ onClick, isSelected, content, boxNumber, onPointerOver, onPointerOut, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  // Create shared geometries and materials
  const shared = useMemo(() => ({
    geometries: {
      box: new THREE.BoxGeometry(1, 1, 1),
      topPlank: new THREE.BoxGeometry(0.4, 0.05, 1.1),
      bottomPlank: new THREE.BoxGeometry(1.2, 0.05, 0.15),
      tapeSide: new THREE.PlaneGeometry(0.15, 1),
      tapeTop: new THREE.PlaneGeometry(1.0, 0.15)
    },
    materials: {
      box: new THREE.MeshStandardMaterial({
        roughness: 1,
        transparent: true,
        opacity: 1
      }),
      pallet: new THREE.MeshStandardMaterial({ 
        color: "#fed7aa", 
        roughness: 0.8 
      }),
      tape: new THREE.MeshStandardMaterial({ 
        color: "#D4D4D4", 
        roughness: 0.8, 
        side: THREE.DoubleSide 
      })
    }
  }), [])

  // Update box color based on state
  shared.materials.box.color.set(isSelected ? '#fdba74' : hovered ? '#fed7aa' : '#fff')

  return (
    <group {...props}>
      {/* Main storage box with tape */}
      <group position={[0, 0.1, 0]}>
        <mesh
          ref={ref}
          receiveShadow
          castShadow
          onClick={(e) => (e.stopPropagation(), onClick())}
          onPointerOver={(e) => (e.stopPropagation(), setHovered(true), onPointerOver(content, boxNumber))}
          onPointerOut={() => (setHovered(false), onPointerOut())}>
          <primitive object={shared.geometries.box} />
          <primitive object={shared.materials.box} />
        </mesh>

        {/* Tape strips */}
        <mesh position={[0, 0.501, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <primitive object={shared.geometries.tapeTop} />
          <primitive object={shared.materials.tape} />
        </mesh>

        {[-0.501, 0.501].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
            <primitive object={shared.geometries.tapeSide} />
            <primitive object={shared.materials.tape} />
          </mesh>
        ))}
      </group>

      {/* Pallet */}
      <group position={[0, -0.35, 0]}>
        {/* Top planks */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={`top-${i}`} position={[x, -0.075, 0]} castShadow receiveShadow>
            <primitive object={shared.geometries.topPlank} />
            <primitive object={shared.materials.pallet} />
          </mesh>
        ))}
        {/* Bottom planks */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`bottom-${i}`} position={[0, -0.125, z]} castShadow receiveShadow>
            <primitive object={shared.geometries.bottomPlank} />
            <primitive object={shared.materials.pallet} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
