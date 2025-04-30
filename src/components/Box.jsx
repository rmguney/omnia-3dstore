'use client'
import { useRef, useState, useMemo } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

// Create shared geometries and materials once at module level
const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  topPlank: new THREE.BoxGeometry(0.4, 0.05, 1.1),
  bottomPlank: new THREE.BoxGeometry(1.2, 0.05, 0.15),
  tapeSide: new THREE.PlaneGeometry(0.15, 1),
  tapeTop: new THREE.PlaneGeometry(1.0, 0.15)
}

const createSharedMaterials = () => ({
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
})

// Cache for material instances
const materialCache = {
  normal: createSharedMaterials(),
  selected: createSharedMaterials(),
  hovered: createSharedMaterials()
}

// Initialize colors for cached materials
materialCache.normal.box.color.set('#fff')
materialCache.selected.box.color.set('#fdba74')
materialCache.hovered.box.color.set('#fed7aa')

export default function Box({ onClick, isSelected, content, boxNumber, fullData, onPointerOver, onPointerOut, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  // Choose the right material based on state
  const materials = useMemo(() => {
    if (isSelected) return materialCache.selected
    if (hovered) return materialCache.hovered
    return materialCache.normal
  }, [isSelected, hovered])

  return (
    <group {...props}>
      {/* Main storage box with tape */}
      <group position={[0, 0.1, 0]}>
        <mesh
          ref={ref}
          receiveShadow
          castShadow
          onClick={(e) => (e.stopPropagation(), onClick())}
          onPointerOver={(e) => (e.stopPropagation(), setHovered(true), onPointerOver(content, boxNumber, fullData))}
          onPointerOut={() => (setHovered(false), onPointerOut())}>
          <primitive object={sharedGeometries.box} />
          <primitive object={materials.box} />
        </mesh>

        {/* Tape strips */}
        <mesh position={[0, 0.501, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <primitive object={sharedGeometries.tapeTop} />
          <primitive object={materials.tape} />
        </mesh>

        {[-0.501, 0.501].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
            <primitive object={sharedGeometries.tapeSide} />
            <primitive object={materials.tape} />
          </mesh>
        ))}
      </group>

      {/* Pallet */}
      <group position={[0, -0.35, 0]}>
        {/* Top planks */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={`top-${i}`} position={[x, -0.075, 0]} castShadow receiveShadow>
            <primitive object={sharedGeometries.topPlank} />
            <primitive object={materials.pallet} />
          </mesh>
        ))}
        {/* Bottom planks */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`bottom-${i}`} position={[0, -0.125, z]} castShadow receiveShadow>
            <primitive object={sharedGeometries.bottomPlank} />
            <primitive object={materials.pallet} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
