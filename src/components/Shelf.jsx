'use client'
import { useRef } from 'react'

export default function Shelf(props) {
  const ref = useRef()
  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow>
      <boxGeometry args={[1.5, 0.2, 1.2]} />
      <meshStandardMaterial roughness={1} transparent opacity={1} color={'#f97316'} />
    </mesh>
  )
}
