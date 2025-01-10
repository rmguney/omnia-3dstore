'use client'
import { useRef, useState } from 'react'
import { useCursor } from '@react-three/drei'

export default function Box({ onClick, isSelected, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow
      onClick={(e) => (e.stopPropagation(), onClick())}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={1}
        transparent
        opacity={1}
        color={isSelected ? '#fdba74' : hovered ? '#fed7aa' : 'white'}
      />
    </mesh>
  )
}
