'use client'
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
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
  // IMPORTANT: All hooks must be called before any conditional returns
  const store = useStore()
  const shadowCameraRef = useRef()
  const [hoveredBox, setHoveredBox] = useState(null)
  const [hoveredBoxNumber, setHoveredBoxNumber] = useState(null)
  
  // Track loading state from store
  const isLoading = useStore(state => state.isLoading)
  const hasApiError = useStore(state => state.hasApiError)
  const apiErrorMessage = useStore(state => state.apiErrorMessage)
  
  // Add virtualization state to track visible areas
  const [visibleBounds, setVisibleBounds] = useState({
    minX: -Infinity, maxX: Infinity, minZ: -Infinity, maxZ: Infinity, expanded: false
  })
  
  // Track initialization state to prevent multiple API calls
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Declare all hooks before any conditional returns
  const handlePointerOver = useCallback((content, boxNumber, fullBoxData) => {
    // Store the full box data in window for HoveredBox to access
    if (typeof window !== 'undefined') {
      window.hoveredBoxData = fullBoxData;
    }
    onPointerOver && onPointerOver(content, boxNumber)
  }, [onPointerOver])

  const handlePointerOut = useCallback(() => {
    onPointerOut && onPointerOut()
  }, [onPointerOut])
  
  // Update visible bounds based on camera position
  const updateVisibleBounds = useCallback(() => {
    if (!store.isFirstPerson) return; // Only apply in first person mode
    
    // Use the existing camera reference
    const camera = window.camera;
    if (!camera) return;
    
    // Calculate view frustum - where camera is looking
    const cameraPosition = camera.position;
    
    // Determine visible area (simple rectangular bounds)
    // Expand by 2 rows/columns in each direction for smooth transitions
    const viewWidth = 5;
    
    const centerX = Math.floor(cameraPosition.x / store.gapX);
    const centerZ = Math.floor(cameraPosition.z / store.gapZ);
    
    setVisibleBounds({
      minX: centerX - viewWidth,
      maxX: centerX + viewWidth,
      minZ: centerZ - viewWidth,
      maxZ: centerZ + viewWidth,
      expanded: true
    });
  }, [store.gapX, store.gapZ, store.isFirstPerson]);

  // Filter boxes for rendering based on visibility
  const isInVisibleRange = useCallback((x, z) => {
    if (!visibleBounds.expanded) return true;
    return x >= visibleBounds.minX && x <= visibleBounds.maxX &&
           z >= visibleBounds.minZ && z <= visibleBounds.maxZ;
  }, [visibleBounds]);
  
  // Memoize plane dimensions calculation to prevent unnecessary recalculations
  const { width: planeWidth, depth: planeDepth, offsetX, offsetZ } = useMemo(() => {
    // Default values in case calculations fail
    const defaults = { 
      width: 50, 
      depth: 50, 
      offsetX: 0, 
      offsetZ: 0 
    };
    
    try {
      const shelvesXPerRow = store.shelvesXPerRow || [0];
      const shelfWidth = Math.max(...shelvesXPerRow) * store.gapX;
      const totalWidth = shelfWidth + store.widthOffsetStart + store.widthOffsetEnd;
      
      if (store.archetype === 'drive') {
        const totalDepth = store.shelvesZ * store.gapZ + store.depthOffsetStart + store.depthOffsetEnd;
        return {
          width: totalWidth || defaults.width,
          depth: totalDepth || defaults.depth,
          offsetX: (store.widthOffsetEnd - store.widthOffsetStart) / 2,
          offsetZ: (store.depthOffsetEnd - store.depthOffsetStart) / 2
        };
      } else {
        const backToBackDepth = store.gapZ + store.backGap;
        const totalPairsDepth = Math.ceil(store.shelvesZ / 2) * backToBackDepth;
        const totalDepth = totalPairsDepth + store.depthOffsetStart + store.depthOffsetEnd;
        return {
          width: totalWidth || defaults.width,
          depth: totalDepth || defaults.depth,
          offsetX: (store.widthOffsetEnd - store.widthOffsetStart) / 2,
          offsetZ: (store.depthOffsetEnd - store.depthOffsetStart) / 2
        };
      }
    } catch (error) {
      console.error("Error calculating plane dimensions:", error);
      return defaults;
    }
  }, [
    store.shelvesXPerRow, 
    store.gapX, 
    store.widthOffsetStart, 
    store.widthOffsetEnd,
    store.shelvesZ, 
    store.gapZ, 
    store.depthOffsetStart, 
    store.depthOffsetEnd,
    store.archetype, 
    store.backGap
  ]);

  // Memoize center calculations for better performance with safety checks
  const { shelvesCenterX, shelvesCenterZ } = useMemo(() => {
    try {
      const shelvesXPerRow = store.shelvesXPerRow || [0];
      return {
        shelvesCenterX: (Math.max(...shelvesXPerRow) - 1) * store.gapX / 2,
        shelvesCenterZ: store.archetype === 'drive'
          ? (store.shelvesZ - 1) * store.gapZ / 2
          : Math.ceil(store.shelvesZ / 2) * (store.gapZ + store.backGap) / 2
      };
    } catch (error) {
      console.error("Error calculating shelf centers:", error);
      return {
        shelvesCenterX: 0,
        shelvesCenterZ: 0
      };
    }
  }, [store.shelvesXPerRow, store.gapX, store.shelvesZ, store.gapZ, store.archetype, store.backGap]);

  // Memoize the getZPosition function with safety checks
  const getZPosition = useCallback((z) => {
    try {
      if (store.archetype === 'drive') {
        return z * store.gapZ - shelvesCenterZ;
      }
      return ((z % 2 === 0 ? 0 : store.gapZ) + 
              Math.floor(z / 2) * (store.backGap + store.gapZ)) - shelvesCenterZ;
    } catch (error) {
      console.error("Error calculating Z position:", error);
      return 0;
    }
  }, [store.archetype, store.gapZ, store.backGap, shelvesCenterZ]);

  // Calculate dome radius based on the maximum dimension
  const domeRadius = useMemo(() => Math.max(planeWidth, planeDepth) * 5, [planeWidth, planeDepth]);

  // Create a box lookup map for more efficient box finding
  const boxLookup = useMemo(() => {
    const lookup = {};
    try {
      if (Array.isArray(store.boxData)) {
        store.boxData.forEach(box => {
          if (box && box.boxNumber && Array.isArray(box.boxNumber)) {
            const [x, y, z] = box.boxNumber;
            const key = `${x}-${y}-${z}`;
            lookup[key] = box;
          }
        });
      }
    } catch (error) {
      console.error("Error creating box lookup:", error);
    }
    return lookup;
  }, [store.boxData]);
  
  // Add memoized rendered boxes to prevent unnecessary rerenders with defensive coding
  const renderedBoxes = useMemo(() => {
    try {
      if (!store.shelvesZ || !store.shelvesY || !Array.isArray(store.shelvesXPerRow)) {
        console.warn("Missing required store data for rendering boxes");
        return null;
      }
      
      return Array.from({ length: store.shelvesZ }, (_, z) =>
        Array.from({ length: store.shelvesY }, (_, y) =>
          Array.from({ length: store.shelvesXPerRow[z] || 0 }, (_, x) => {
            // Skip if not in visible range (virtualization)
            if (!isInVisibleRange(x, z)) return null;
            
            const zPosition = getZPosition(z);
            const boxKey = `${x}-${y}-${z}`;
            const box = boxLookup[boxKey];
            const shelfPosition = [x * store.gapX - shelvesCenterX, y * store.gapY, zPosition];
            
            return (
              <group key={`group-${store.selectedStore}-${x}-${y}-${z}`}>
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
                    onPointerOver={() => handlePointerOver(box.content, box.boxNumber, box)}
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
            );
          }).filter(Boolean) // Remove null elements
        )
      );
    } catch (error) {
      console.error("Error rendering boxes:", error);
      return null;
    }
  }, [
    store.shelvesZ, 
    store.shelvesY, 
    store.shelvesXPerRow, 
    boxLookup, 
    store.selectedBox, 
    store.selectedStore, 
    store.gapX, 
    store.gapY,
    isInVisibleRange,
    getZPosition,
    shelvesCenterX,
    handlePointerOver,
    handlePointerOut
  ]);
  
  // All useEffect hooks must be declared before any conditional returns
  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      store.initializeBoxData()
      setIsInitialized(true)
    }
  }, [store, isInitialized])
  
  useEffect(() => {
    if (store.isFirstPerson) {
      const interval = setInterval(updateVisibleBounds, 500);
      return () => clearInterval(interval);
    } else {
      // When in orbit mode, render everything
      setVisibleBounds({
        minX: -Infinity, maxX: Infinity,
        minZ: -Infinity, maxZ: Infinity,
        expanded: false
      });
    }
  }, [store.isFirstPerson, updateVisibleBounds]);

  // Prepare UI components for different states
  const loadingUI = (
    <div className="fixed inset-0 backdrop-blur-md bg-blue-950/90 flex flex-col items-center justify-center z-50">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-[3px] border-indigo-400/80 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 border-[3px] border-violet-400/50 border-b-transparent rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.2s'}}></div>
      </div>
      <p className="text-orange-400 text-base font-light tracking-wider" 
         style={{textShadow: '0 0 10px rgba(0, 0, 0, 0.5), 0 0 3px rgba(0, 0, 0, 0.8)'}}>
        Yükleniyor
      </p>
    </div>
  );

  const errorUI = (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-950 bg-opacity-80 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-red-600 mb-2">API Error</p>
        <p className="text-gray-700 mb-4">{apiErrorMessage || 'Failed to load warehouse data. Using fallback data instead.'}</p>
        <button 
          onClick={() => {
            setIsInitialized(false);
            store.initializeBoxData();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const missingDataUI = (
    <div className="fixed inset-0 flex items-center justify-center bg-blue-950 bg-opacity-80 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md">
        <p className="text-lg font-semibold text-red-600 mb-2">Missing Data</p>
        <p className="text-gray-700 mb-4">Essential configuration data is missing. Please try again.</p>
        <button 
          onClick={() => {
            setIsInitialized(false);
            store.initializeBoxData();
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          Reload Data
        </button>
      </div>
    </div>
  );

  const mainContent = (
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
            {Array.from({ length: store.shelvesZ || 0 }, (_, z) => (
              <PillarSet 
                key={`pillar-set-${store.selectedStore}-${z}`}
                rowIndex={z}
                shelvesCenterX={shelvesCenterX}
                shelvesCenterZ={shelvesCenterZ}
              />
            ))}
          </RigidBody>
          
          {/* Use memoized rendered boxes instead of directly rendering them here */}
          {renderedBoxes}

          {/* Render loading areas for all layout types */}
          {store.loadingAreas && 
            Object.entries(store.loadingAreas).map(([key, config]) => (
              <LoadingArea
                key={`loading-area-${store.selectedStore}-${key}`}
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
  );

  // After all hooks have been called, now we can safely return conditionally
  if (isLoading) {
    return loadingUI;
  }

  if (hasApiError) {
    return errorUI;
  }

  if (!store || !store.shelvesXPerRow || !Array.isArray(store.shelvesXPerRow)) {
    return missingDataUI;
  }

  return mainContent;
}