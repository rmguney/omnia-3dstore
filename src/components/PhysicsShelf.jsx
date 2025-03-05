'use client'
import { useRef } from 'react'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { SHELF_DIMENSIONS } from './Shelf'

/**
 * An optimized shelf component with integrated physics
 * This combines the visual and physical properties in one component
 */
export default function PhysicsShelf({ position }) {
  const ref = useRef()

  return (
    <RigidBody type="fixed" position={position}>
      {/* Visual mesh */}
      <mesh
        ref={ref}
        receiveShadow
        castShadow>
        <boxGeometry args={[SHELF_DIMENSIONS.width, SHELF_DIMENSIONS.height, SHELF_DIMENSIONS.depth]} />
        <meshStandardMaterial roughness={1} transparent opacity={1} color={'#f97316'} />
      </mesh>
      
      {/* Physics collider */}
      <CuboidCollider 
        args={[
          SHELF_DIMENSIONS.width/2,  
          SHELF_DIMENSIONS.height/2, 
          SHELF_DIMENSIONS.depth/2   
        ]}
        position={[0, 0, 0]} 
      />
    </RigidBody>
  )
}
