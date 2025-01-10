'use client'

export default function Stage({ shadowCameraRef }) {
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
