import { useMemo } from 'react'
import * as THREE from 'three'

export default function DomeEnvironment({ width, depth }) {
  const radius = Math.max(width, depth) * 6
  // Reduce segments for better performance
  const segments = Math.min(32, Math.max(16, Math.floor(radius / 5)))
  const rings = Math.min(16, Math.max(8, Math.floor(radius / 10)))
  // Increase grid step for fewer lines
  const gridStep = 4
  const groundColor = "#172554"

  const gridLines = useMemo(() => {
    const lines = []
    
    // Adaptive grid - fewer lines for larger radius
    const actualSegments = Math.floor(segments / gridStep) * gridStep
    const actualRings = Math.floor(rings / gridStep) * gridStep
    
    // Longitude lines - reduce total number
    for (let i = 0; i < actualSegments; i += gridStep) {
      const angle = (i / actualSegments) * Math.PI * 2
      const points = []
      // Use fewer points for smoother lines but better performance
      for (let j = 0; j <= actualRings; j += gridStep/2) {
        const phi = (j / actualRings) * (Math.PI / 2)
        const x = radius * Math.cos(angle) * Math.cos(phi)
        const y = radius * Math.sin(phi)
        const z = radius * Math.sin(angle) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      lines.push(points)
    }
    
    // Latitude lines - reduce total number
    for (let j = gridStep; j < actualRings; j += gridStep) {
      const phi = (j / actualRings) * (Math.PI / 2)
      const points = []
      for (let i = 0; i <= actualSegments; i += gridStep/2) {
        const angle = (i / actualSegments) * Math.PI * 2
        const x = radius * Math.cos(angle) * Math.cos(phi)
        const y = radius * Math.sin(phi)
        const z = radius * Math.sin(angle) * Math.cos(phi)
        points.push(new THREE.Vector3(x, y, z))
      }
      lines.push(points)
    }
    
    return lines
  }, [radius, segments, rings, gridStep])

  // Use low-poly ground geometry
  const groundGeometry = useMemo(() => {
    return new THREE.CircleGeometry(radius, Math.min(64, segments * 2))
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
