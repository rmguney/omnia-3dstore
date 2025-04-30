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
  const selectedStore = useStore(state => state.selectedStore)
  const store = useStore()

  // Add refs for animation
  const animating = useRef(false)
  const targetCameraPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())
  const currentLookAt = useRef(new THREE.Vector3())
  
  // Add throttling/debouncing for camera movement
  const lastUpdateTime = useRef(0)
  const updateThrottle = 16 // Reduced from 50 to 16ms (60fps) for silky-smooth animation
  
  // Add user interaction state
  const userInteracting = useRef(false)
  
  // Track if camera is still moving to block hover events
  const lastInteractionTime = useRef(0)
  const isMoving = useRef(false)
  
  // Make camera rotation state globally available
  useEffect(() => {
    // Add global access to camera state
    window.cameraIsMoving = isMoving;
    
    // Make the release of camera movement lock more aggressive
    return () => {
      if (window.cameraIsMoving) {
        window.cameraIsMoving.current = false;
      }
    };
  }, [])

  // Clear camera position cache when store changes
  useEffect(() => {
    // Reset camera position when store changes
    if (cameraPositionCache.current) {
      cameraPositionCache.current.clear();
    }
    
    // Reset camera position to default
    if (camera) {
      camera.position.set(25, 11, 9);
      camera.lookAt(0, 0, 0);
    }
    
    // Reset controls if they exist
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    
    // Reset animation state
    animating.current = false;
  }, [camera, selectedStore]);

  // Add lerp helper function
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Add function to smoothly move camera
  const smoothMoveCamera = (targetPos, lookAtPos) => {
    animating.current = true;
    targetCameraPos.current.copy(targetPos);
    targetLookAt.current.copy(lookAtPos);
    currentLookAt.current.copy(controlsRef.current.target);
  };

  // Cache the best camera position results to avoid recalculations
  const cameraPositionCache = useRef(new Map())

  // Add function to find best camera position with caching
  const findBestCameraPosition = (targetPos) => {
    // Create a cache key from the target position
    const cacheKey = `${Math.round(targetPos.x*100)}-${Math.round(targetPos.y*100)}-${Math.round(targetPos.z*100)}`
    
    // Check if we already calculated this position
    if (cameraPositionCache.current.has(cacheKey)) {
      return cameraPositionCache.current.get(cacheKey)
    }
    
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
            const result = { position: cameraPos, found: true }
            cameraPositionCache.current.set(cacheKey, result)
            return result
          }
        }
      }
    }
    
    // If no clear view found, return the default offset position
    const result = {
      position: new THREE.Vector3(
        targetPos.x + 5,
        targetPos.y + 3,
        targetPos.z + 5
      ),
      found: false
    }
    
    cameraPositionCache.current.set(cacheKey, result)
    return result
  }

  // Add frame loop for smooth animation with throttling
  useFrame(() => {
    if (animating.current && controlsRef.current && !userInteracting.current) {
      const now = Date.now()
      
      // Throttle updates to avoid excessive calculations
      if (now - lastUpdateTime.current < updateThrottle) {
        return
      }
      
      lastUpdateTime.current = now
      
      // Even smoother animation with slightly reduced acceleration
      const SMOOTH_FACTOR = 0.2; // Reduced from 0.25 for a smoother movement
      const DISTANCE_THRESHOLD = 0.12; // Keep same threshold

      // Update camera position
      const newX = lerp(camera.position.x, targetCameraPos.current.x, SMOOTH_FACTOR);
      const newY = lerp(camera.position.y, targetCameraPos.current.y, SMOOTH_FACTOR);
      const newZ = lerp(camera.position.z, targetCameraPos.current.z, SMOOTH_FACTOR);
      camera.position.set(newX, newY, newZ);

      // Update look at target - keep slightly faster than camera movement
      const newLookAtX = lerp(currentLookAt.current.x, targetLookAt.current.x, SMOOTH_FACTOR * 1.1);
      const newLookAtY = lerp(currentLookAt.current.y, targetLookAt.current.y, SMOOTH_FACTOR * 1.1);
      const newLookAtZ = lerp(currentLookAt.current.z, targetLookAt.current.z, SMOOTH_FACTOR * 1.1);
      currentLookAt.current.set(newLookAtX, newLookAtY, newLookAtZ);
      controlsRef.current.target.copy(currentLookAt.current);

      // Check if we're close enough to stop animation
      const positionDistance = camera.position.distanceTo(targetCameraPos.current);
      const targetDistance = currentLookAt.current.distanceTo(targetLookAt.current);
      
      if (positionDistance < DISTANCE_THRESHOLD && targetDistance < DISTANCE_THRESHOLD) {
        // Animation is done - immediately enable hover interactions
        animating.current = false;
        isMoving.current = false;
        
        // Force immediate hover activation by clearing the timer completely
        lastInteractionTime.current = 0;
        
        // Snap directly to final position for precision
        camera.position.copy(targetCameraPos.current);
        currentLookAt.current.copy(targetLookAt.current);
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      } else {
        // Still animating - block hover interactions
        isMoving.current = true;
        lastInteractionTime.current = Date.now();
      }

      controlsRef.current.update();
    } else if (userInteracting.current) {
      // User is manually controlling the camera
      isMoving.current = true;
      lastInteractionTime.current = Date.now();
    } else {
      // Camera is idle - enable hover instantly (1ms instead of 5ms)
      if (Date.now() - lastInteractionTime.current > 1) {
        isMoving.current = false;
      }
    }
  });

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

      const targetPosition = { x, y, z }; // Renamed from targetPos to targetPosition
      const { position: cameraPos } = findBestCameraPosition(targetPosition);

      // Immediately block hover interactions when animation starts
      isMoving.current = true;
      lastInteractionTime.current = Date.now();
      
      // Much smaller initial jump for smoother start
      const startPos = new THREE.Vector3().copy(camera.position);
      const jumpFactor = 0.2; // Reduced from 0.3 for a much smoother start
      const jumpPos = new THREE.Vector3().lerpVectors(
        startPos, 
        cameraPos, 
        jumpFactor
      );
      
      // Reduce look-at target jump even further
      const targetVector3 = new THREE.Vector3(x, y, z);
      const currentTarget = controlsRef.current.target.clone();
      const jumpTarget = new THREE.Vector3().lerpVectors(
        currentTarget,
        targetVector3,
        0.25 // Reduced from 0.4 for smoother look-at transition
      );
      
      // Start animation from the jump points
      camera.position.copy(jumpPos);
      controlsRef.current.target.copy(jumpTarget);
      
      // Set animation state
      animating.current = true;

      // Use smooth move for final part of movement
      smoothMoveCamera(
        cameraPos,
        targetVector3 // Updated to use the renamed variable
      );
    }
  }, [focusedBox, store, shelvesCenterX, shelvesCenterZ, scene, planeWidth, planeDepth]);
  
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
      // Increase damping factor to reduce momentum even more - maximum damping for instant stops
      enableDamping={true}
      dampingFactor={0.4}
      onStart={() => {
        userInteracting.current = true;
        isMoving.current = true;
        lastInteractionTime.current = Date.now();
        store.clearFocusedBox();  // Clear focused box when user starts interacting
        animating.current = false;
      }}
      onEnd={() => {
        userInteracting.current = false;
        // isMoving will be set to false after the shorter cooldown period
        lastInteractionTime.current = Date.now();
      }}
      onChange={() => {
        // Update timestamp on any camera change
        lastInteractionTime.current = Date.now();
        isMoving.current = true;
        
        // Handle radius constraint with immediate correction
        const pos = camera.position;
        const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);

        // Handle height constraint
        if (pos.y < minY) {
          pos.y = minY;
        }

        // Handle radius constraint with immediate correction
        if (distanceFromCenter > radius) {
          const scale = radius / distanceFromCenter;
          pos.x *= scale;
          pos.z *= scale;
          // Update target to maintain look direction
          if (controlsRef.current) {
            const target = controlsRef.current.target;
            const targetDist = Math.sqrt(target.x * target.x + target.z * target.z);
            if (targetDist > radius) {
              const targetScale = radius / targetDist;
              target.x *= targetScale;
              target.z *= targetScale;
            }
          }
        }
      }}
    />
  )
}
