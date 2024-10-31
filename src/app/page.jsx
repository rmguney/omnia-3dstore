'use client'
import './styles.css'
import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CycleRaycast, useCursor, OrbitControls, SoftShadows } from '@react-three/drei'

export default function App() {
  const [{ objects, cycle }, set] = useState({ objects: [], cycle: 0 })
  const [boxCount, setBoxCount] = useState(5)
  const shadowCameraRef = useRef() // Reference for the shadow camera

  const handleBoxCountChange = (e) => {
    const count = parseInt(e.target.value, 10)
    setBoxCount(count > 0 ? count : 0)
  }

  // Force shadow update when box count changes
  useEffect(() => {
    if (shadowCameraRef.current) shadowCameraRef.current.needsUpdate = true
  }, [boxCount])

  return (
    <>
      <div className="controls">
        <label>Palet Sayısı: </label>
        <input type="number" value={boxCount} onChange={handleBoxCountChange} min="0" />
      </div>

      <div className="status">
        {objects.map((_, i) => (<div key={i} className="dot" style={{ background: i === cycle ? '#000' : '#000' }} />)) }
        {objects.length ? <div className="name" style={{ left: cycle * 14, padding: 2 }} children={objects[cycle].object.name} /> : null}
      </div>
      <Canvas shadows dpr={1.5} orthographic camera={{ position: [10, 20, -15], zoom: 80, near: 1, far: 1000 }}>
        <SoftShadows samples={16} size={15} />
        <OrbitControls 
          enableRotate
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 4} 
        />
        <LogCamera />
        <Stage shadowCameraRef={shadowCameraRef} />
        {Array.from({ length: boxCount }, (_, i) => (
          <Box
            key={i}
            name={(i + 1) + '. Palet'}
            position={[i * 2, 0, 0]}
          />
        ))}
        <CycleRaycast onChanged={(objects, cycle) => set({ objects, cycle })} />
      </Canvas>
    </>
  )
}

function LogCamera() {
  const { camera } = useThree()
  useFrame(() => {
    console.log('Camera Position:', camera.position)
    console.log('Camera Rotation:', camera.rotation)
  })
  return null
}


function Box(props) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  useFrame((state) => ref.current.scale.setScalar(hovered ? 1 + Math.sin(state.clock.elapsedTime * 10) / 50 : 1))
  useCursor(hovered)
  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow
      onClick={(e) => (e.stopPropagation(), setClicked(!clicked))}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={(e) => setHovered(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={1} transparent opacity={0.95} color={clicked ? '#f97316' : hovered ? '#fb923c' : 'white'} />
    </mesh>
  )
}

function Stage({ shadowCameraRef }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight
        ref={shadowCameraRef}
        position={[1, 10, -2]}
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
      <directionalLight position={[-10, -10, 2]} intensity={3} />
      <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -0.75, 0]}>
        <planeGeometry args={[80, 80]} />
        <shadowMaterial opacity={0.2} />
      </mesh>
    </>
  )
}
