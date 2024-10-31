'use client'
import './styles.css'
import { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CycleRaycast, useCursor, OrbitControls, SoftShadows } from '@react-three/drei'

export default function App() {
  const [{ objects, cycle }, set] = useState({ objects: [], cycle: 0 })
  const shadowCameraRef = useRef()

  // State for the number of shelves along each axis
  const [shelvesX, setShelvesX] = useState(6)
  const [shelvesY, setShelvesY] = useState(3)
  const [shelvesZ, setShelvesZ] = useState(6) // Adjust for back-to-back pairs
  
  // State for the gaps between shelves on each axis
  const [gapX, setGapX] = useState(2)
  const [gapY, setGapY] = useState(2)
  const [gapZ, setGapZ] = useState(7) // Larger gap between pairs on z-axis
  const [pairGap, setPairGap] = useState(1.2) // Gap inside each back-to-back pair
  
  // State for each box's presence
  const [boxData, setBoxData] = useState(initializeBoxData(3, 3, 6))

  // Track the currently selected box for toggling presence
  const [selectedBox, setSelectedBox] = useState(null)

  // Function to initialize or reset boxData based on current shelves dimensions
  function initializeBoxData(xCount, yCount, zCount) {
    return Array.from({ length: xCount }, () =>
      Array.from({ length: yCount }, () => 
        Array.from({ length: zCount }, () => ({ present: true }))
      )
    )
  }

  // Update boxData whenever the number of shelves changes
  useEffect(() => {
    setBoxData(initializeBoxData(shelvesX, shelvesY, shelvesZ))
  }, [shelvesX, shelvesY, shelvesZ])

  // Toggle the presence of the selected box
  const toggleBoxPresence = () => {
    if (selectedBox) {
      const { x, y, z } = selectedBox
      setBoxData(prevData => {
        const newData = prevData.map((planeX, i) =>
          planeX.map((planeY, j) =>
            planeY.map((box, k) =>
              i === x && j === y && k === z ? { present: !box.present } : box
            )
          )
        )
        return newData
      })
    }
  }

  return (
    <>
      <div className="controls">
        <label>Shelves X: </label>
        <input type="number" value={shelvesX} onChange={(e) => setShelvesX(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
        <label>Shelves Y: </label>
        <input type="number" value={shelvesY} onChange={(e) => setShelvesY(Math.max(1, parseInt(e.target.value) || 1))} min="1" />
        <label>Shelves Z: </label>
        <input type="number" value={shelvesZ} onChange={(e) => setShelvesZ(Math.max(2, parseInt(e.target.value) || 2))} min="2" step="2" />

        <label>Gap X: </label>
        <input type="number" value={gapX} onChange={(e) => setGapX(parseFloat(e.target.value) || 0)} min="0" />
        <label>Gap Y: </label>
        <input type="number" value={gapY} onChange={(e) => setGapY(parseFloat(e.target.value) || 0)} min="0" />
        <label>Gap Z (between pairs): </label>
        <input type="number" value={gapZ} onChange={(e) => setGapZ(parseFloat(e.target.value) || 0)} min="0" />
        <label>Pair Gap (inside): </label>
        <input type="number" value={pairGap} onChange={(e) => setPairGap(parseFloat(e.target.value) || 0)} min="0" />
      </div>

      {/* UI Panel to toggle box presence */}
      {selectedBox && (
        <div className="box-controls">
          <h3>Box Controls for ({selectedBox.x}, {selectedBox.y}, {selectedBox.z})</h3>
          <label>
            Present:
            <input
              type="checkbox"
              checked={boxData[selectedBox.x][selectedBox.y][selectedBox.z]?.present}
              onChange={toggleBoxPresence}
            />
          </label>
        </div>
      )}

      <Canvas shadows dpr={1.5} orthographic camera={{ position: [25, 35, -22], zoom: 30, near: 1, far: 1000 }}>
        <SoftShadows samples={16} size={15} />
        <OrbitControls enableRotate minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 4} />
        <LogCamera />
        <Stage shadowCameraRef={shadowCameraRef} />

        {/* Render shelves with dynamic gaps and back-to-back layout on z-axis */}
        {Array.from({ length: shelvesX }, (_, x) =>
          Array.from({ length: shelvesY }, (_, y) =>
            Array.from({ length: shelvesZ }, (_, z) => {
              // Calculate z position for back-to-back shelving with a larger gap after each pair
              const zPosition = (z % 2 === 0 ? 0 : pairGap) + Math.floor(z / 2) * (gapZ + pairGap);
              return (
                <Shelf 
                  key={`shelf-${x}-${y}-${z}`}
                  position={[
                    x * gapX, // Apply gap along x-axis
                    y * gapY, // Apply gap along y-axis
                    zPosition // Back-to-back logic for z-axis
                  ]}
                />
              )
            })
          )
        )}

        {/* Render boxes based on boxData presence, ensuring boxData is initialized */}
        {boxData && Array.from({ length: shelvesX }, (_, x) =>
          Array.from({ length: shelvesY }, (_, y) =>
            Array.from({ length: shelvesZ }, (_, z) => {
              const zPosition = (z % 2 === 0 ? 0 : pairGap) + Math.floor(z / 2) * (gapZ + pairGap);
              return (
                boxData[x]?.[y]?.[z]?.present && (
                  <Box
                    key={`box-${x}-${y}-${z}`}
                    position={[
                      x * gapX,       // Align with shelf x position
                      y * gapY + 0.6, // Slightly above the shelf to sit on top
                      zPosition       // Back-to-back logic for z-axis
                    ]}
                    onClick={() => setSelectedBox({ x, y, z })} // Open UI on click
                    isSelected={selectedBox && selectedBox.x === x && selectedBox.y === y && selectedBox.z === z} // Highlight selected box
                  />
                )
              );
            })
          )
        )}

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

function Shelf(props) {
  const ref = useRef()
  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow>
      <boxGeometry args={[1.5, 0.2, 1.2]} />
      <meshStandardMaterial roughness={1} transparent opacity={1} color={'#f97316'} />
    </mesh>
  )
}

function Box({ onClick, isSelected, ...props }) {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)
  
  return (
    <mesh
      {...props}
      ref={ref}
      receiveShadow
      castShadow
      onClick={(e) => (e.stopPropagation(), onClick())} // Trigger UI on click
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={() => setHovered(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        roughness={1}
        transparent
        opacity={1}
        color={isSelected ? '#fdba74' : hovered ? '#fed7aa' : 'white'} // Change color based on selection and hover
      />
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
