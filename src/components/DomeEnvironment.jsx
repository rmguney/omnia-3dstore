import { useMemo } from 'react'
import * as THREE from 'three'

export default function DomeEnvironment({ width, depth }) {
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
