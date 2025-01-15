'use client'
import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '@/store/store'
import Box from './Box'
import Shelf from './Shelf'

function FirstPersonCamera() {
  const { camera } = useThree()
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  const speed = 0.15
  const direction = useRef(new THREE.Vector3())
  const frontVector = useRef(new THREE.Vector3())
  const sideVector = useRef(new THREE.Vector3())

  useEffect(() => {
    camera.position.set(0, 2, 5)

    const handleKeyDown = (e) => {
      switch(e.code) {
        case 'KeyW': moveState.current.forward = true; break
        case 'KeyS': moveState.current.backward = true; break
        case 'KeyA': moveState.current.left = true; break
        case 'KeyD': moveState.current.right = true; break
      }
    }

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'KeyW': moveState.current.forward = false; break
        case 'KeyS': moveState.current.backward = false; break
        case 'KeyA': moveState.current.left = false; break
        case 'KeyD': moveState.current.right = false; break
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
    frontVector.current.set(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward))
    sideVector.current.set(Number(moveState.current.left) - Number(moveState.current.right), 0, 0)

    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation)

    camera.position.add(direction.current)
  })

  return <PointerLockControls />
}

function OrbitCamera() {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
  }, [camera])

  return <OrbitControls makeDefault />
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

  return (
    <>
      <Canvas shadows camera={{ fov: 75 }}>
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
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
          <planeGeometry args={[planeWidth, planeDepth]} />
          <meshStandardMaterial color="#172554" />
        </mesh>
        
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
                  <Shelf position={[x * store.gapX - shelvesCenterX, y * store.gapY, zPosition - shelvesCenterZ]} />
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
      </Canvas>
      
      {store.isFirstPerson && <div className="fixed top-1/2 left-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-50"></div>}
    </>
  )
}