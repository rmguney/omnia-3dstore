'use client'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider } from '@react-three/rapier'
import * as THREE from 'three'
import useStore from '@/store/store'
import Box from './Box'
import Shelf from './Shelf'
import PillarSet from './PillarSet'

function FirstPersonCamera() {
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

    frontVector.current.set(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward))
    sideVector.current.set(Number(moveState.current.left) - Number(moveState.current.right), 0, 0)

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation)

    const impulse = { x: direction.current.x, y: 0, z: direction.current.z }
    
    // Set velocity directly instead of applying impulse for more direct control
    playerRef.current.setLinvel({ 
      x: direction.current.x * speed, 
      y: playerRef.current.linvel().y, 
      z: direction.current.z * speed 
    })
    
    const playerPosition = playerRef.current.translation()
    camera.position.set(playerPosition.x, playerPosition.y + 2, playerPosition.z)
  })

  return (
    <>
      <PointerLockControls />
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

function OrbitCamera() {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return <OrbitControls makeDefault />
}

function Pillar({ position }) {
  const pillarWidth = 0.15  // Made thinner since we'll have two
  const pillarDepth = 0.15  // Made thinner since we'll have two
  const store = useStore()
  const shelfThickness = 0.2
  const extraHeight = -1.5
  const totalHeight = (store.shelvesY * (store.gapY + shelfThickness)) + extraHeight
  const groundOffset = -0.75

  return (
    <mesh 
      position={[
        position[0], 
        groundOffset + (totalHeight/2),
        position[2]
      ]} 
      receiveShadow 
      castShadow
    >
      <boxGeometry args={[pillarWidth, totalHeight, pillarDepth]} />
      <meshStandardMaterial roughness={1} color={'#f97316'} />
    </mesh>
  )
}

export default function Scene({ onPointerOver, onPointerOut }) {
  const store = useStore()
  const shadowCameraRef = useRef()
  const [hoveredBox, setHoveredBox] = useState(null)
  const [hoveredBoxNumber, setHoveredBoxNumber] = useState(null)
  
  useEffect(() => {
    store.initializeBoxData()
  }, [])

  const handlePointerOver = (content, boxNumber) => {
    onPointerOver && onPointerOver(content, boxNumber)
  }

  const handlePointerOut = () => {
    onPointerOut && onPointerOut()
  }
  const widthOffset= 30;
  const depthOffset= -10;
  const planeWidth = Math.max(...store.shelvesXPerRow) * store.gapX + widthOffset
  const planeDepth = store.shelvesZ * store.gapZ + (Math.floor(store.shelvesZ / 2) * store.backGap) + depthOffset
  const shelvesCenterX = (Math.max(...store.shelvesXPerRow) - 1) * store.gapX / 2
  const shelvesCenterZ = (store.shelvesZ - 1) * (store.gapZ + store.backGap) / 4

  const wallHeight = 0.3 // Height of barrier walls
  const wallThickness = 0.3 // Thickness of barrier walls

  return (
    <>
      <Canvas shadows camera={{ fov: 75 }}>
        <Physics gravity={[0, -9.81, 0]}>
          {store.isFirstPerson ? <FirstPersonCamera /> : <OrbitCamera />}
          
          <ambientLight intensity={0.9} />
          <directionalLight
            ref={shadowCameraRef}
            position={[5, 15, -5]} // Adjusted position for more angle
            intensity={2}
            shadow-camera-far={200}
            shadow-camera-left={-40}
            shadow-camera-right={40}
            shadow-camera-top={40}
            shadow-camera-bottom={-40}
            shadow-mapSize={[4096, 4096]}
            shadow-bias={-0.0005}
            castShadow
          />
          <directionalLight position={[-15, -15, 5]} intensity={3} /> {/* Adjusted position for more angle */}
          <RigidBody type="fixed">
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
              <planeGeometry args={[planeWidth, planeDepth]} />
              <meshStandardMaterial color="#172554" />
            </mesh>
            
            {/* Barrier walls */}
            {/* Front wall */}
            <mesh position={[0, -0.75 + wallHeight/2, planeDepth/2]}>
              <boxGeometry args={[planeWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color="#172554" />
            </mesh>
            
            {/* Back wall */}
            <mesh position={[0, -0.75 + wallHeight/2, -planeDepth/2]}>
              <boxGeometry args={[planeWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color="#172554" />
            </mesh>
            
            {/* Left wall */}
            <mesh position={[-planeWidth/2, -0.75 + wallHeight/2, 0]}>
              <boxGeometry args={[wallThickness, wallHeight, planeDepth]} />
              <meshStandardMaterial color="#172554" />
            </mesh>
            
            {/* Right wall */}
            <mesh position={[planeWidth/2, -0.75 + wallHeight/2, 0]}>
              <boxGeometry args={[wallThickness, wallHeight, planeDepth]} />
              <meshStandardMaterial color="#172554" />
            </mesh>

            {/* Replace old pillars code with PillarSet components */}
            {Array.from({ length: store.shelvesZ }, (_, z) => (
              <PillarSet 
                key={`pillar-set-${z}`}
                rowIndex={z}
                shelvesCenterX={shelvesCenterX}
                shelvesCenterZ={shelvesCenterZ}
              />
            ))}
          </RigidBody>
          
          {/* Scene objects */}
          {Array.from({ length: store.shelvesZ }, (_, z) =>
            Array.from({ length: store.shelvesY }, (_, y) =>
              Array.from({ length: store.shelvesXPerRow[z] }, (_, x) => {
                const zPosition = (z % 2 === 0 ? 0 : store.gapZ) + 
                                  Math.floor(z / 2) * (store.backGap + store.gapZ)
                const box = store.boxData.find(box => 
                  box.boxNumber[0] === x && 
                  box.boxNumber[1] === y && 
                  box.boxNumber[2] === z
                )
                return (
                  <group key={`group-${x}-${y}-${z}`}>
                    <RigidBody type="fixed">
                      <Shelf position={[x * store.gapX - shelvesCenterX, y * store.gapY, zPosition - shelvesCenterZ]} />
                    </RigidBody>
                    {box && (
                      <Box
                        position={[x * store.gapX - shelvesCenterX, y * store.gapY + 0.6, zPosition - shelvesCenterZ]}
                        onClick={() => store.setSelectedBox({ x, y, z })}
                        onPointerOver={() => handlePointerOver(box.content, box.boxNumber)}
                        onPointerOut={handlePointerOut}
                        content={box.content}
                        boxNumber={box.boxNumber}
                        isSelected={store.selectedBox && 
                                  store.selectedBox.x === x && 
                                  store.selectedBox.y === y && 
                                  store.selectedBox.z === z}
                      />
                    )}
                  </group>
                )
              })
            )
          )}
        </Physics>
      </Canvas>
      
      {store.isFirstPerson && <div className="fixed top-1/2 left-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-50"></div>}
    </>
  )
}