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
  const segments = 32
  const rings = 16
  const gridStep = 2
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

function OrbitCamera({ planeWidth, planeDepth, shelvesCenterX, shelvesCenterZ }) {  // Add these props
  const { camera, scene } = useThree()  // Add scene to useThree
  const radius = Math.max(planeWidth, planeDepth) * 0.95
  const controlsRef = useRef()
  const minY = 2
  const focusedBox = useStore(state => state.focusedBox)
  const store = useStore()  // Add this to access store values

  // Add refs for animation
  const animating = useRef(false)
  const targetCameraPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())

  // Add lerp helper function
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Add function to smoothly move camera
  const smoothMoveCamera = (targetPos, lookAtPos) => {
    animating.current = true;
    targetCameraPos.current.copy(targetPos);
    targetLookAt.current.copy(lookAtPos);
    currentLookAt.current.copy(controlsRef.current.target);
  };

  // Add frame loop for smooth animation
  useFrame(() => {
    if (animating.current && controlsRef.current && !userInteracting.current) {
      const SMOOTH_FACTOR = 0.05; // Adjust this value to change animation speed
      const DISTANCE_THRESHOLD = 0.01;

      // Update camera position
      const newX = lerp(camera.position.x, targetCameraPos.current.x, SMOOTH_FACTOR);
      const newY = lerp(camera.position.y, targetCameraPos.current.y, SMOOTH_FACTOR);
      const newZ = lerp(camera.position.z, targetCameraPos.current.z, SMOOTH_FACTOR);
      camera.position.set(newX, newY, newZ);

      // Update look at target
      const newLookAtX = lerp(currentLookAt.current.x, targetLookAt.current.x, SMOOTH_FACTOR);
      const newLookAtY = lerp(currentLookAt.current.y, targetLookAt.current.y, SMOOTH_FACTOR);
      const newLookAtZ = lerp(currentLookAt.current.z, targetLookAt.current.z, SMOOTH_FACTOR);
      currentLookAt.current.set(newLookAtX, newLookAtY, newLookAtZ);
      controlsRef.current.target.copy(currentLookAt.current);

      // Check if we're close enough to stop animation
      const positionDistance = camera.position.distanceTo(targetCameraPos.current);
      const targetDistance = currentLookAt.current.distanceTo(targetLookAt.current);
      
      if (positionDistance < DISTANCE_THRESHOLD && targetDistance < DISTANCE_THRESHOLD) {
        animating.current = false;
      }

      controlsRef.current.update();
    }
  });

  useEffect(() => {
    camera.position.set(25, 11, 9)  // Initial orbit camera position on page load: x=15, y=15, z=15
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Add function to find best camera position
  const findBestCameraPosition = (targetPos) => {
    const angles = [0, Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4]
    const distances = [5, 7, 9, 11]  // Try different distances
    const heights = [3, 4, 5, 6]     // Try different heights
    
    // Create raycaster
    const raycaster = new THREE.Raycaster()
    const targetVector = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
    
    // Try all combinations to find clear line of sight
    for (let distance of distances) {
      for (let height of heights) {
        for (let angle of angles) {
          // Calculate potential camera position
          const x = targetPos.x + distance * Math.cos(angle)
          const y = targetPos.y + height
          const z = targetPos.z + distance * Math.sin(angle)
          const cameraPos = new THREE.Vector3(x, y, z)
          
          // Set up raycaster
          const direction = new THREE.Vector3()
          direction.subVectors(targetVector, cameraPos).normalize()
          raycaster.set(cameraPos, direction)
          
          // Check for intersections
          const intersects = raycaster.intersectObjects(scene.children, true)
          
          // If no intersections or first intersection is our target, this position is good
          if (intersects.length === 0 || 
              (intersects[0].point.distanceTo(targetVector) < 1)) {
            return { position: cameraPos, found: true }
          }
        }
      }
    }
    
    // If no clear view found, return the default offset position
    return {
      position: new THREE.Vector3(
        targetPos.x + 5,
        targetPos.y + 3,
        targetPos.z + 5
      ),
      found: false
    }
  }

  // Update focus animation with new camera positioning
  useEffect(() => {
    if (focusedBox && controlsRef.current) {
      let x, y, z;
      
      if (focusedBox.isLoadingArea && focusedBox.areaKey) {
        // Get the specific loading area directly using the areaKey
        const area = store.loadingAreas[focusedBox.areaKey];
        
        if (area) {
          const margin = 1.0;
          x = area.position.includes('Right') 
            ? planeWidth/2 - margin - (area.boxesX * area.gapX)/2
            : -planeWidth/2 + margin + (area.boxesX * area.gapX)/2;
          
          y = focusedBox.boxNumber[1] * area.gapY + 1;
          
          z = area.position.includes('back') 
            ? planeDepth/2 - margin - (area.boxesZ * area.gapZ)/2
            : -planeDepth/2 + margin + (area.boxesZ * area.gapZ)/2;
          
          // Adjust for box position within loading area
          x += (focusedBox.boxNumber[0] - (area.boxesX - 1)/2) * area.gapX;
          z += (focusedBox.boxNumber[2] - (area.boxesZ - 1)/2) * area.gapZ;
        }
      } else {
        // Regular shelf box position calculation
        x = focusedBox.boxNumber[0] * store.gapX - shelvesCenterX;
        y = focusedBox.boxNumber[1] * store.gapY + 1;
        z = (focusedBox.boxNumber[2] % 2 === 0 ? 0 : store.gapZ) + 
            Math.floor(focusedBox.boxNumber[2] / 2) * (store.backGap + store.gapZ) - 
            shelvesCenterZ;
      }

      const targetPos = { x, y, z };
      const { position: cameraPos } = findBestCameraPosition(targetPos);

      smoothMoveCamera(
        cameraPos,
        new THREE.Vector3(x, y, z)
      );
    }
  }, [focusedBox, store, shelvesCenterX, shelvesCenterZ, scene, planeWidth, planeDepth]);

  // Add user interaction state
  const userInteracting = useRef(false)

  // Update OrbitControls return
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
      onStart={() => {
        userInteracting.current = true;
        store.clearFocusedBox();  // Clear focused box when user starts interacting
        animating.current = false;
      }}
      onEnd={() => {
        userInteracting.current = false;
      }}
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

function GroundBorder({ width, depth, position }) {
  const borderThickness = 1.00; // border thickness
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    // Outer rectangle
    shape.moveTo(-width/2 - borderThickness, -depth/2 - borderThickness);
    shape.lineTo(width/2 + borderThickness, -depth/2 - borderThickness);
    shape.lineTo(width/2 + borderThickness, depth/2 + borderThickness);
    shape.lineTo(-width/2 - borderThickness, depth/2 + borderThickness);
    shape.lineTo(-width/2 - borderThickness, -depth/2 - borderThickness);

    // Inner hole
    const hole = new THREE.Path();
    hole.moveTo(-width/2, -depth/2);
    hole.lineTo(width/2, -depth/2);
    hole.lineTo(width/2, depth/2);
    hole.lineTo(-width/2, depth/2);
    hole.lineTo(-width/2, -depth/2);
    shape.holes.push(hole);

    return shape;
  }, [width, depth]);

  return (
    <mesh rotation-x={-Math.PI / 2} position={position}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial 
        color="#ea580c"
        roughness={1}
        metalness={0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Update LoadingArea component to include onClick handler
function LoadingArea({ config, planeWidth, planeDepth, offsetX, offsetZ, onPointerOver, onPointerOut }) {
  const getPosition = () => {
    const margin = 1.0; // reduced margin to be closer to border
    const x = config.position.includes('Right') 
      ? planeWidth/2 - margin - (config.boxesX * config.gapX)/2 + offsetX
      : -planeWidth/2 + margin + (config.boxesX * config.gapX)/2 + offsetX;
    
    const z = config.position.includes('back') 
      ? planeDepth/2 - margin - (config.boxesZ * config.gapZ)/2 + offsetZ
      : -planeDepth/2 + margin + (config.boxesZ * config.gapZ)/2 + offsetZ;

    return [x, 0, z];
  }

  const [x, y, z] = getPosition();

  // Create positions array for all possible box positions
  const positions = [];
  let currentId = 1;

  // Fill positions in correct order: X → Z → Y
  for (let py = 0; py < config.boxesY; py++) {
    for (let pz = 0; pz < config.boxesZ; pz++) {
      for (let px = 0; px < config.boxesX; px++) {
        positions.push({
          pos: [px, py, pz],
          id: currentId++
        });
      }
    }
  }

  const store = useStore();

  return (
    <group position={[x, y, z]}>
      {positions.map(({ pos: [px, py, pz], id }) => {
        // For back areas, reverse the order of box placement
        const adjustedPx = config.position.includes('back') 
          ? (config.boxesX - 1) - px  // Reverse X for back areas
          : px;
          
        const adjustedPz = config.position.includes('back') 
          ? (config.boxesZ - 1) - pz  // Reverse Z for back areas
          : pz;
          
        const box = config.boxes?.find(b => 
          b.boxNumber[0] === px && 
          b.boxNumber[1] === py && 
          b.boxNumber[2] === pz
        );
        
        if (!box) return null;

        return (
          <Box
            key={`loading-${config.position}-${px}-${py}-${pz}`}
            position={[
              (adjustedPx - (config.boxesX - 1)/2) * config.gapX,
              py * config.gapY,
              (adjustedPz - (config.boxesZ - 1)/2) * config.gapZ
            ]}
            content={`${box.content} (${id})`}
            boxNumber={[px, py, pz]}
            onClick={() => store.setFocusedBox([px, py, pz], true, config.position)}
            onPointerOver={() => onPointerOver(box.content, [px, py, pz])}
            onPointerOut={onPointerOut}
            isSelected={store.selectedBox && 
              store.selectedBox.isLoadingArea &&
              store.selectedBox.areaKey === config.position &&
              store.selectedBox.x === px &&
              store.selectedBox.y === py &&
              store.selectedBox.z === pz}
          />
        );
      })}
    </group>
  );
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
  
  // Update plane calculations to properly account for shelf positions
  const calculatePlaneDimensions = () => {
    const shelfWidth = Math.max(...store.shelvesXPerRow) * store.gapX;
    const totalWidth = shelfWidth + store.widthOffsetStart + store.widthOffsetEnd;
    
    if (store.archetype === 'drive') {
      const totalDepth = store.shelvesZ * store.gapZ + store.depthOffsetStart + store.depthOffsetEnd;
      return {
        width: totalWidth,
        depth: totalDepth,
        // Add offset positions for centering
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
        // Add offset positions for centering
        offsetX: (store.widthOffsetEnd - store.widthOffsetStart) / 2,
        offsetZ: (store.depthOffsetEnd - store.depthOffsetStart) / 2
      };
    }
  };

  const { width: planeWidth, depth: planeDepth, offsetX, offsetZ } = calculatePlaneDimensions();

  // Update center calculations for proper positioning
  const shelvesCenterX = (Math.max(...store.shelvesXPerRow) - 1) * store.gapX / 2;
  const shelvesCenterZ = store.archetype === 'drive'
    ? (store.shelvesZ - 1) * store.gapZ / 2
    : Math.ceil(store.shelvesZ / 2) * (store.gapZ + store.backGap) / 2;

  const getZPosition = (z) => {
    if (store.archetype === 'drive') {
      return z * store.gapZ - shelvesCenterZ;
    }
    return ((z % 2 === 0 ? 0 : store.gapZ) + 
            Math.floor(z / 2) * (store.backGap + store.gapZ)) - shelvesCenterZ;
  };

  const domeRadius = Math.max(planeWidth, planeDepth) * 5;

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

            {/* Fix PillarSet rendering - remove the +1 for drive layout */}
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
                const zPosition = getZPosition(z);
                const box = store.boxData.find(box => 
                  box.boxNumber[0] === x && 
                  box.boxNumber[1] === y && 
                  box.boxNumber[2] === z
                )
                return (
                  <group key={`group-${x}-${y}-${z}`}>
                    <RigidBody type="fixed">
                      <Shelf position={[x * store.gapX - shelvesCenterX, y * store.gapY, zPosition]} />
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

          {/* Update loading areas rendering - remove archetype condition */}
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