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

function HoverInfo({ content }) {
  return (
    <div className="hover-info">
      {content}
    </div>
  )
}

export default function Scene() {
  const store = useStore()
  const shadowCameraRef = useRef()
  const [hoveredBox, setHoveredBox] = useState(null)
  
  useEffect(() => {
    store.initializeBoxData()
  }, [])

  return (
    <>
      <button 
        onClick={store.toggleCameraMode}
        className="camera-mode-button"
      >
        {store.isFirstPerson ? 'Yörüngesel Kamera' : 'Birinci Şahıs Kamera'}
      </button>

      <Canvas shadows camera={{ fov: 75 }}>
        {store.isFirstPerson ? <FirstPersonCamera /> : <OrbitCamera />}
        
        <ambientLight intensity={0.9} />
        <directionalLight
          ref={shadowCameraRef}
          position={[1, 10, -2]}
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
        <directionalLight position={[-10, -10, 2]} intensity={3} />
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
          <planeGeometry args={[80, 80]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
        
        {/* Scene objects */}
        {store.boxData && Array.from({ length: store.shelvesX }, (_, x) =>
          Array.from({ length: store.shelvesY }, (_, y) =>
            Array.from({ length: store.shelvesZ }, (_, z) => {
              const zPosition = (z % 2 === 0 ? 0 : store.pairGap) + 
                              Math.floor(z / 2) * (store.gapZ + store.pairGap)
              const box = store.boxData[x][y][z]
              return (
                <group key={`group-${x}-${y}-${z}`}>
                  <Shelf position={[x * store.gapX, y * store.gapY, zPosition]} />
                  {box.present && (
                    <Box
                      position={[x * store.gapX, y * store.gapY + 0.6, zPosition]}
                      onClick={() => store.setSelectedBox({ x, y, z })}
                      onPointerOver={() => setHoveredBox(box.content)}
                      onPointerOut={() => setHoveredBox(null)}
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

      {hoveredBox && <HoverInfo content={hoveredBox} />}
    </>
  )
}
