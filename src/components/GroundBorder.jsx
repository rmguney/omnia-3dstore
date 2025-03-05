import { useMemo } from 'react'
import * as THREE from 'three'

export default function GroundBorder({ width, depth, position }) {
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
