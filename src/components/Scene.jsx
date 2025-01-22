'use client'
import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, OrbitControls } from '@react-three/drei'
import { Physics, RigidBody, CapsuleCollider, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import useStore from '@/store/store'
import Box from './Box'
import Shelf from './Shelf'
import PillarSet from './PillarSet'

function DomeEnvironment({ width, depth }) {
  const radius = Math.max(width, depth) * 6
  const segments = 32  // Back to more segments for lines
  const rings = 16    // Back to more rings for lines
  const gridStep = 2   // Draw more lines (every 2nd line)
  const groundColor = "#172554"

  const gridLines = useMemo(() => {
    const lines = []
    
    // Longitude lines
    for (let i = 0; i < segments; i += gridStep) {
      const angle = (i / segments) * Math.PI * 2
      const points = []
      for (let j = 0; j <= rings; j++) {  // Use all points for smoother lines
        const phi = (j / rings) * (Math.PI / 2)
        const x = radius * Math.cos(angle) * Math.cos(phi)
        const y = radius * Math.sin(phi)
        const z = radius * Math.sin(angle) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      lines.push(points)
    }
    
    // Latitude lines
    for (let j = gridStep; j < rings; j += gridStep) {
      const phi = (j / rings) * (Math.PI / 2)
      const points = []
      for (let i = 0; i <= segments; i++) {  // Use all points for smoother lines
        const angle = (i / segments) * Math.PI * 2
        const x = radius * Math.cos(angle) * Math.cos(phi)
        const y = radius * Math.sin(phi)
        const z = radius * Math.sin(angle) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      lines.push(points)
    }
    
    return lines
  }, [radius, segments])

  // Create ground circle
  const groundGeometry = useMemo(() => {
    return new THREE.CircleGeometry(radius, segments)
  }, [radius, segments])

  return (
    <group position={[0, -0.75, 0]}>
      <group>
        {gridLines.map((points, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={points.length}
                array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color="gray" 
              opacity={0.3} 
              transparent 
              depthWrite={false}
              linewidth={1}
            />
          </line>
        ))}
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0]}>
        <primitive object={groundGeometry} />
        <meshStandardMaterial 
          color={groundColor} 
          opacity={1} 
          transparent={false}
          roughness={1}
        />
      </mesh>
    </group>
  )
}

function FirstPersonCamera({ planeWidth, planeDepth }) {
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

function OrbitCamera({ planeWidth, planeDepth }) {
  const { camera } = useThree()
  const radius = Math.max(planeWidth, planeDepth) * 0.95
  const controlsRef = useRef()
  const minY = 2

  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return (
    <OrbitControls 
      ref={controlsRef}
      makeDefault
      maxPolarAngle={Math.PI / 2 - 0.1}
      minPolarAngle={0.1}
      maxDistance={radius}
      minDistance={2}
      enableRotate={true}
      rotateSpeed={0.5}
      enablePan={true}
      panSpeed={0.5}
      onChange={(e) => {
        const pos = e.target.object.position
        const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)

        // Handle height constraint
        if (pos.y < minY) {
          pos.y = minY
        }

        // Handle radius constraint with immediate correction
        if (distanceFromCenter > radius) {
          const scale = radius / distanceFromCenter
          pos.x *= scale
          pos.z *= scale
          // Update target to maintain look direction
          if (controlsRef.current) {
            const target = controlsRef.current.target
            const targetDist = Math.sqrt(target.x * target.x + target.z * target.z)
            if (targetDist > radius) {
              const targetScale = radius / targetDist
              target.x *= targetScale
              target.z *= targetScale
            }
          }
        }
      }}
    />
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

  const domeRadius = Math.max(planeWidth, planeDepth) * 5  // Match DomeEnvironment radius calculation

  return (
    <>
      <Canvas shadows camera={{ fov: 75 }}>
        <Physics gravity={[0, -9.81, 0]}>
          {store.isFirstPerson ? <FirstPersonCamera planeWidth={planeWidth} planeDepth={planeDepth} /> : <OrbitCamera planeWidth={planeWidth} planeDepth={planeDepth} />}
          
          {/* Ground collider sized to match dome */}
          <RigidBody type="fixed" position={[0, -0.75, 0]}>
            <CuboidCollider args={[domeRadius, 0.1, domeRadius]} position={[0, 0, 0]} />
          </RigidBody>

          <DomeEnvironment width={planeWidth} depth={planeDepth} />
          
          <ambientLight intensity={0.9} />
          <directionalLight
            ref={shadowCameraRef}
            position={[5, 15, -5]}
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
          <directionalLight position={[-15, -15, 5]} intensity={3} />
          <RigidBody type="fixed">
            <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
              <planeGeometry args={[planeWidth, planeDepth]} />
              <meshStandardMaterial color="#172554" />
            </mesh>

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