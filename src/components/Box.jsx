'use client'
import { useRef, useState, useMemo } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

export default function Box({ onClick, isSelected, content, boxNumber, onPointerOver, onPointerOut, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  // Create shared geometries and materials
  const sharedGeometries = useMemo(() => ({
    plank: new THREE.BoxGeometry(0.4, 0.05, 1.1),
    bottomPlank: new THREE.BoxGeometry(1.2, 0.05, 0.15),
    tape: new THREE.PlaneGeometry(0.15, 1),
    topTape: new THREE.PlaneGeometry(1.0, 0.15)
  }), [])

  const sharedMaterials = useMemo(() => ({
    plank: new THREE.MeshStandardMaterial({ color: "#172554", roughness: 0.8 }),
    bottomPlank: new THREE.MeshStandardMaterial({ color: "#0f172a", roughness: 0.9 }),
    tape: new THREE.MeshStandardMaterial({ 
      color: "#D4D4D4", 
      roughness: 0.8, 
      side: THREE.DoubleSide 
    })
  }), [])

  return (
    <group {...props}>
      {/* Main storage box - moved up by 0.5 to sit on pallet */}
      <group position={[0, 0.1, 0]}>
        <mesh
          ref={ref}
          receiveShadow
          castShadow
          onClick={(e) => (e.stopPropagation(), onClick())}
          onPointerOver={(e) => (e.stopPropagation(), setHovered(true), onPointerOver(content, boxNumber))}
          onPointerOut={() => (setHovered(false), onPointerOut())}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            roughness={1}
            transparent
            opacity={1}
            color={isSelected ? '#fdba74' : hovered ? '#fed7aa' : '#f1f5f9'}
          />
        </mesh>

        {/* Duct tape using shared geometries */}
        <mesh position={[0, 0.501, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <primitive object={sharedGeometries.topTape} />
          <primitive object={sharedMaterials.tape} />
        </mesh>

        {[-0.501, 0.501].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
            <primitive object={sharedGeometries.tape} />
            <primitive object={sharedMaterials.tape} />
          </mesh>
        ))}
      </group>

      {/* Pallet using shared geometries */}
      <group position={[0, -0.35, 0]}>
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={`top-${i}`} position={[x, -0.075, 0]} castShadow receiveShadow>
            <primitive object={sharedGeometries.plank} />
            <primitive object={sharedMaterials.plank} />
          </mesh>
        ))}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`bottom-${i}`} position={[0, -0.125, z]} castShadow receiveShadow>
            <primitive object={sharedGeometries.bottomPlank} />
            <primitive object={sharedMaterials.bottomPlank} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
