import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'
import useStore from '@/store/store'

export default function FirstPersonCamera({ planeWidth, planeDepth }) {
  const { camera } = useThree()
  const playerRef = useRef()
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  const initialPosition = [0, 1, 5] // Store initial position for respawn
  const speed = 4
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())

  const respawnPlayer = () => {
    if (playerRef.current) {
      playerRef.current.setTranslation({ x: initialPosition[0], y: initialPosition[1], z: initialPosition[2] })
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }) // Reset velocity
      camera.position.set(initialPosition[0], initialPosition[1] + 2, initialPosition[2])
    }
  }

  useEffect(() => {
    camera.position.set(0, 2, 5)

    const handleKeyDown = (e) => {
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp': 
          moveState.current.forward = true; 
          break;
        case 'KeyS':
        case 'ArrowDown': 
          moveState.current.backward = true; 
          break;
        case 'KeyA':
        case 'ArrowLeft': 
          moveState.current.left = true; 
          break;
        case 'KeyD':
        case 'ArrowRight': 
          moveState.current.right = true; 
          break;
        case 'KeyR':
          respawnPlayer();
          break;
        case 'KeyQ':
          useStore.getState().toggleCameraMode();
          break;
      }
    }

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp': 
          moveState.current.forward = false; 
          break;
        case 'KeyS':
        case 'ArrowDown': 
          moveState.current.backward = false; 
          break;
        case 'KeyA':
        case 'ArrowLeft': 
          moveState.current.left = false; 
          break;
        case 'KeyD':
        case 'ArrowRight': 
          moveState.current.right = false; 
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [camera])

  useFrame(() => {
    if (!playerRef.current) return

    // Calculate movement direction
    frontVector.current.set(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward))
    sideVector.current.set(Number(moveState.current.left) - Number(moveState.current.right), 0, 0)

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation)

    const radius = Math.max(planeWidth, planeDepth) * 0.95
    const playerPos = playerRef.current.translation()
    
    // Calculate next position
    const nextX = playerPos.x + direction.current.x * speed * 0.016
    const nextZ = playerPos.z + direction.current.z * speed * 0.016
    const distanceFromCenter = Math.sqrt(nextX ** 2 + nextZ ** 2)

    // Apply movement with boundary check
    if (distanceFromCenter < radius) {
      playerRef.current.setLinvel({ 
        x: direction.current.x * speed, 
        y: playerRef.current.linvel().y, 
        z: direction.current.z * speed 
      })
    } else {
      // If at boundary, allow sliding along it
      const angle = Math.atan2(playerPos.z, playerPos.x)
      const tangentX = -Math.sin(angle)
      const tangentZ = Math.cos(angle)
      const dot = direction.current.x * tangentX + direction.current.z * tangentZ
      playerRef.current.setLinvel({
        x: tangentX * dot * speed,
        y: playerRef.current.linvel().y,
        z: tangentZ * dot * speed
      })
    }
    
    const currentPos = playerRef.current.translation()
    camera.position.set(currentPos.x, currentPos.y + 2, currentPos.z)
  })

  return (
    <>
      <PointerLockControls makeDefault />
      <RigidBody
        ref={playerRef}
        position={[0, 1, 5]}
        enabledRotations={[false, false, false]}
        mass={1}
        type="dynamic"
        colliders={false}
        linearDamping={5}
        friction={1}
      >
        <CapsuleCollider args={[1, 0.5]} />
      </RigidBody>
    </>
  )
}
