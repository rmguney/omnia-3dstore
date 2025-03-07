'use client'
import { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Physics, RigidBody, CuboidCollider } from '@react-three/rapier'
import * as THREE from 'three'
import useStore from '@/store/store'
import Box from './Box'
import Shelf, { SHELF_DIMENSIONS } from './Shelf'
import PillarSet from './PillarSet'
import DomeEnvironment from './DomeEnvironment'
import FirstPersonCamera from './FirstPersonCamera'
import OrbitCamera from './OrbitCamera'
import GroundBorder from './GroundBorder'
import LoadingArea from './LoadingArea'

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
  
  // Memoize plane dimensions calculation to prevent unnecessary recalculations
  const { width: planeWidth, depth: planeDepth, offsetX, offsetZ } = useMemo(() => {
    const shelfWidth = Math.max(...store.shelvesXPerRow) * store.gapX;
    const totalWidth = shelfWidth + store.widthOffsetStart + store.widthOffsetEnd;
    
    if (store.archetype === 'drive') {
      const totalDepth = store.shelvesZ * store.gapZ + store.depthOffsetStart + store.depthOffsetEnd;
      return {
        width: totalWidth,
        depth: totalDepth,
        offsetX: (store.widthOffsetEnd - store.widthOffsetStart) / 2,
        offsetZ: (store.depthOffsetEnd - store.depthOffsetStart) / 2
      };
    } else {
      const backToBackDepth = store.gapZ + store.backGap;
      const totalPairsDepth = Math.ceil(store.shelvesZ / 2) * backToBackDepth;
      const totalDepth = totalPairsDepth + store.depthOffsetStart + store.depthOffsetEnd;
      return {
        width: totalWidth,
        depth: totalDepth,
        offsetX: (store.widthOffsetEnd - store.widthOffsetStart) / 2,
        offsetZ: (store.depthOffsetEnd - store.depthOffsetStart) / 2
      };
    }
  }, [store.shelvesXPerRow, store.gapX, store.widthOffsetStart, store.widthOffsetEnd, 
      store.shelvesZ, store.gapZ, store.depthOffsetStart, store.depthOffsetEnd, 
      store.archetype, store.backGap]);

  // Memoize center calculations for better performance
  const { shelvesCenterX, shelvesCenterZ } = useMemo(() => ({
    shelvesCenterX: (Math.max(...store.shelvesXPerRow) - 1) * store.gapX / 2,
    shelvesCenterZ: store.archetype === 'drive'
      ? (store.shelvesZ - 1) * store.gapZ / 2
      : Math.ceil(store.shelvesZ / 2) * (store.gapZ + store.backGap) / 2
  }), [store.shelvesXPerRow, store.gapX, store.shelvesZ, store.gapZ, store.archetype, store.backGap]);

  // Memoize the getZPosition function to ensure consistent calculations
  const getZPosition = useMemo(() => (z) => {
    if (store.archetype === 'drive') {
      return z * store.gapZ - shelvesCenterZ;
    }
    return ((z % 2 === 0 ? 0 : store.gapZ) + 
            Math.floor(z / 2) * (store.backGap + store.gapZ)) - shelvesCenterZ;
  }, [store.archetype, store.gapZ, store.backGap, shelvesCenterZ]);

  // Calculate dome radius based on the maximum dimension
  const domeRadius = useMemo(() => Math.max(planeWidth, planeDepth) * 5, [planeWidth, planeDepth]);

  // Create a box lookup map for more efficient box finding
  const boxLookup = useMemo(() => {
    const lookup = {};
    store.boxData.forEach(box => {
      const [x, y, z] = box.boxNumber;
      lookup[`${x}-${y}-${z}`] = box;
    });
    return lookup;
  }, [store.boxData]);

  return (
    <>
      <Canvas shadows camera={{ fov: 75 }}>
        <Physics gravity={[0, -9.81, 0]}>
          {store.isFirstPerson ? 
            <FirstPersonCamera planeWidth={planeWidth} planeDepth={planeDepth} /> : 
            <OrbitCamera 
              planeWidth={planeWidth} 
              planeDepth={planeDepth}
              shelvesCenterX={shelvesCenterX}
              shelvesCenterZ={shelvesCenterZ}
            />
          }
          
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
            <mesh 
              receiveShadow 
              rotation-x={-Math.PI / 2} 
              position={[offsetX, -0.75, offsetZ]}
            >
              <planeGeometry args={[planeWidth, planeDepth]} />
              <meshStandardMaterial color="#172554" />
            </mesh>

            <GroundBorder 
              width={planeWidth} 
              depth={planeDepth} 
              position={[offsetX, -0.745, offsetZ]} 
            />

            {/* Render pillar sets correctly for both layout archetypes */}
            {Array.from({ length: store.shelvesZ }, (_, z) => (
              <PillarSet 
                key={`pillar-set-${z}`}
                rowIndex={z}
                shelvesCenterX={shelvesCenterX}
                shelvesCenterZ={shelvesCenterZ}
              />
            ))}
          </RigidBody>
          
          {/* Render shelves and boxes with optimized lookup */}
          {Array.from({ length: store.shelvesZ }, (_, z) =>
            Array.from({ length: store.shelvesY }, (_, y) =>
              Array.from({ length: store.shelvesXPerRow[z] }, (_, x) => {
                const zPosition = getZPosition(z);
                const box = boxLookup[`${x}-${y}-${z}`];
                const shelfPosition = [x * store.gapX - shelvesCenterX, y * store.gapY, zPosition];
                
                return (
                  <group key={`group-${x}-${y}-${z}`}>
                    <RigidBody type="fixed" position={shelfPosition}>
                      <Shelf />
                      <CuboidCollider 
                        args={[
                          SHELF_DIMENSIONS.width/2,  // Half width (Rapier uses half-extents)
                          SHELF_DIMENSIONS.height/2, // Half height
                          SHELF_DIMENSIONS.depth/2   // Half depth
                        ]}
                        position={[0, 0, 0]} // Centered on the RigidBody
                      />
                    </RigidBody>
                    {box && (
                      <Box
                        position={[x * store.gapX - shelvesCenterX, y * store.gapY + 0.6, zPosition]}
                        onClick={() => store.setFocusedBox([x, y, z], false)}
                        onPointerOver={() => handlePointerOver(box.content, box.boxNumber)}
                        onPointerOut={handlePointerOut}
                        content={box.content}
                        boxNumber={box.boxNumber}
                        isSelected={store.selectedBox && 
                                  !store.selectedBox.isLoadingArea &&
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

          {/* Render loading areas for all layout types */}
          {store.loadingAreas && 
            Object.entries(store.loadingAreas).map(([key, config]) => (
              <LoadingArea
                key={`loading-area-${key}`}
                config={config}
                planeWidth={planeWidth}
                planeDepth={planeDepth}
                offsetX={offsetX}
                offsetZ={offsetZ}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
              />
            ))}

        </Physics>
      </Canvas>
      
      {store.isFirstPerson && <div className="fixed top-1/2 left-1/2 w-2.5 h-2.5 bg-orange-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-50"></div>}
    </>
  )
}