import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '@/store/store'

export default function OrbitCamera({ planeWidth, planeDepth, shelvesCenterX, shelvesCenterZ }) {
  const { camera, scene } = useThree()
  const radius = Math.max(planeWidth, planeDepth) * 0.95
  const controlsRef = useRef()
  const minY = 2
  const focusedBox = useStore(state => state.focusedBox)
  const store = useStore()

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
