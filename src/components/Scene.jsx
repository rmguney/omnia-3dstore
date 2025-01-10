'use client'
import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CycleRaycast, OrbitControls, SoftShadows } from '@react-three/drei'
import useStore from '@/store/store'
import Box from './Box'
import Shelf from './Shelf'
import Stage from './Stage'

function LogCamera() {
  const { camera } = useThree()
  useFrame(() => {
    console.log('Camera Position:', camera.position)
    console.log('Camera Rotation:', camera.rotation)
  })
  return null
}

function CenterScene() {
  const { camera, controls } = useThree()
  const store = useStore()

  useEffect(() => {
    // Calculate actual scene dimensions with exact object sizes
    const totalWidth = (store.shelvesX - 1) * store.gapX + 1.5
    const totalHeight = (store.shelvesY - 1) * store.gapY + 1.6 // Increased for box height
    const totalDepth = ((store.shelvesZ / 2) - 1) * (store.gapZ + store.pairGap) + store.pairGap + 1.2

    // Calculate exact center
    const centerX = totalWidth / 2
    const centerY = totalHeight / 2
    const centerZ = totalDepth / 2

    // Much tighter zoom calculation
    const aspectRatio = window.innerWidth / window.innerHeight
    const viewportHeight = Math.max(totalHeight, totalWidth / aspectRatio, totalDepth)
    const padding = 1.1 
    const zoom = 500 / (viewportHeight * padding) // base zoom

    // Closer camera distance
    const distance = Math.max(totalWidth, totalHeight, totalDepth) * 0.2

    // Position camera closer while maintaining angle
    camera.position.set(
      centerX + distance * 0.6, // Reduced from 0.7
      centerY + distance * 0.6,
      -centerZ - distance * 0.6
    )
    camera.zoom = zoom * 1.2 // Additional zoom factor
    camera.updateProjectionMatrix()

    // Center controls precisely
    if (controls) {
      controls.target.set(centerX, centerY, -centerZ)
      controls.update()
    }
  }, [store.shelvesX, store.shelvesY, store.shelvesZ, store.gapX, store.gapY, store.gapZ, store.pairGap])

  return null
}

export default function Scene() {
  const shadowCameraRef = useRef()
  const store = useStore()
  
  useEffect(() => {
    store.initializeBoxData()
  }, [])

  return (
    <>
      {store.selectedBox && (
        <div className="box-controls">
          <h3>Box Controls for ({store.selectedBox.x}, {store.selectedBox.y}, {store.selectedBox.z})</h3>
          <label>
            Present:
            <input
              type="checkbox"
              checked={store.boxData[store.selectedBox.x][store.selectedBox.y][store.selectedBox.z]?.present}
              onChange={store.toggleBoxPresence}
            />
          </label>
        </div>
      )}

      <Canvas shadows dpr={1.5} orthographic camera={{ position: [25, 35, -22], zoom: 30, near: 1, far: 1000 }}>
        <SoftShadows samples={16} size={15} />
        <OrbitControls 
          enableRotate 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 4}
          makeDefault // Important: makes controls available via useThree
        />
        <CenterScene />
        <LogCamera />
        <Stage shadowCameraRef={shadowCameraRef} />

        {/* Render grid */}
        {Array.from({ length: store.shelvesX }, (_, x) =>
          Array.from({ length: store.shelvesY }, (_, y) =>
            Array.from({ length: store.shelvesZ }, (_, z) => {
              const zPosition = (z % 2 === 0 ? 0 : store.pairGap) + 
                              Math.floor(z / 2) * (store.gapZ + store.pairGap);
              return (
                <group key={`group-${x}-${y}-${z}`}>
                  <Shelf 
                    position={[x * store.gapX, y * store.gapY, zPosition]}
                  />
                  {store.boxData?.[x]?.[y]?.[z]?.present && (
                    <Box
                      position={[x * store.gapX, y * store.gapY + 0.6, zPosition]}
                      onClick={() => store.setSelectedBox({ x, y, z })}
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
    </>
  )
}
