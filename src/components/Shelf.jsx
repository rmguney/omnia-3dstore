'use client'
import { useRef } from 'react'

export default function Shelf(props) {
  const ref = useRef()
  const shelfWidth = 1.5
  const shelfHeight = 0.2
  const shelfDepth = 1.2

  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow>
      <boxGeometry args={[shelfWidth, shelfHeight, shelfDepth]} />
      <meshStandardMaterial roughness={1} transparent opacity={1} color={'#f97316'} />
    </mesh>
  )
}
