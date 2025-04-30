'use client'
import { useRef, useState, useEffect } from 'react'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'

// Create shared geometries once at module level
const sharedGeometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  topPlank: new THREE.BoxGeometry(0.4, 0.05, 1.1),
  bottomPlank: new THREE.BoxGeometry(1.2, 0.05, 0.15),
  tapeSide: new THREE.PlaneGeometry(0.15, 1),
  tapeTop: new THREE.PlaneGeometry(1.0, 0.15)
}

// Create shared materials once at module level
const sharedMaterials = {
  box: new THREE.MeshStandardMaterial({
    roughness: 1,
    transparent: true,
    opacity: 1
  }),
  pallet: new THREE.MeshStandardMaterial({ 
    color: "#fed7aa", 
    roughness: 0.8 
  }),
  tape: new THREE.MeshStandardMaterial({ 
    color: "#D4D4D4", 
    roughness: 0.8, 
    side: THREE.DoubleSide 
  })
}

// Create material instances for different box types
const malKabulMaterial = sharedMaterials.box.clone();
malKabulMaterial.color.set('#fde68a'); // Light yellow for non-standard boxes

export default function Box({ onClick, isSelected, content, boxNumber, fullData, onPointerOver, onPointerOut, isNonStandardLocation = false, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  
  // Track current box state with refs to avoid unnecessary re-renders
  const boxStateRef = useRef({ 
    isSelected, 
    isHovered: false, 
    isNonStandardLocation 
  });
  
  useCursor(hovered)
  
  // Store the box's current color in a ref to avoid unnecessary updates
  const currentColorRef = useRef(isNonStandardLocation ? '#fde68a' : '#fff');
  
  // Create local box material that's isolated to this instance
  const boxMaterial = useRef(
    isNonStandardLocation ? malKabulMaterial.clone() : sharedMaterials.box.clone()
  );
  
  // Update box material color when state changes
  useEffect(() => {
    const stateChanged = 
      boxStateRef.current.isSelected !== isSelected || 
      boxStateRef.current.isHovered !== hovered ||
      boxStateRef.current.isNonStandardLocation !== isNonStandardLocation;
      
    if (stateChanged) {
      boxStateRef.current = { isSelected, isHovered: hovered, isNonStandardLocation };
      
      // Determine the new color based on state
      let newColor;
      if (isNonStandardLocation) {
        newColor = isSelected ? '#fbbf24' : hovered ? '#fcd34d' : '#fde68a';
      } else {
        newColor = isSelected ? '#fdba74' : hovered ? '#fed7aa' : '#fff';
      }
      
      // Only update if color actually changed
      if (newColor !== currentColorRef.current) {
        boxMaterial.current.color.set(newColor);
        currentColorRef.current = newColor;
      }
    }
  }, [isSelected, hovered, isNonStandardLocation]);
  
  // Check if camera is rotating before processing hover events - with super aggressive check
  const isCameraStill = () => {
    // Aggressive check: if the feature exists at all, trust it completely
    if (typeof window !== 'undefined' && window.cameraIsMoving) {
      return !window.cameraIsMoving.current;
    }
    return true;
  };
  
  // Eliminate debounce completely for instant response when camera stops
  
  return (
    <group {...props}>
      {/* Main storage box with tape */}
      <group position={[0, 0.1, 0]}>
        <mesh
          ref={ref}
          receiveShadow
          castShadow
          onClick={(e) => (e.stopPropagation(), onClick())}
          onPointerOver={(e) => {
            e.stopPropagation();
            
            // Complete skip of hover handling during camera movement
            if (!isCameraStill()) return;
            
            // Once camera is still, process hover immediately
            if (!hovered) {
              setHovered(true);
              onPointerOver(content, boxNumber, fullData);
            }
          }}
          onPointerOut={() => {
            setHovered(false);
            onPointerOut();
          }}>
          <primitive object={sharedGeometries.box} />
          <primitive object={boxMaterial.current} attach="material" />
        </mesh>

        {/* Tape strips */}
        <mesh position={[0, 0.501, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <primitive object={sharedGeometries.tapeTop} />
          <primitive object={sharedMaterials.tape} attach="material" />
        </mesh>

        {[-0.501, 0.501].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow>
            <primitive object={sharedGeometries.tapeSide} />
            <primitive object={sharedMaterials.tape} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Pallet */}
      <group position={[0, -0.35, 0]}>
        {/* Top planks */}
        {[-0.35, 0.35].map((x, i) => (
          <mesh key={`top-${i}`} position={[x, -0.075, 0]} castShadow receiveShadow>
            <primitive object={sharedGeometries.topPlank} />
            <primitive object={sharedMaterials.pallet} attach="material" />
          </mesh>
        ))}
        {/* Bottom planks */}
        {[-0.35, 0.35].map((z, i) => (
          <mesh key={`bottom-${i}`} position={[0, -0.125, z]} castShadow receiveShadow>
            <primitive object={sharedGeometries.bottomPlank} />
            <primitive object={sharedMaterials.pallet} attach="material" />
          </mesh>
        ))}
      </group>
    </group>
  )
}
