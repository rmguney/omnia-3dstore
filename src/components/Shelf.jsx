'use client'
import { useRef } from 'react'

// These dimensions need to be available both inside the component and for external use
export const SHELF_DIMENSIONS = {
  width: 1.5,
  height: 0.2,
  depth: 1.2
}

export default function Shelf(props) {
  const ref = useRef()

  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow>
      <boxGeometry args={[SHELF_DIMENSIONS.width, SHELF_DIMENSIONS.height, SHELF_DIMENSIONS.depth]} />
      <meshStandardMaterial roughness={1} transparent opacity={1} color={'#f97316'} />
    </mesh>
  )
}
