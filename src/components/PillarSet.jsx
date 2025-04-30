'use client'
import useStore from '@/store/store'

function Pillar({ position }) {
  const pillarWidth = 0.2
  const pillarDepth = 0.2
  const store = useStore()
  const shelfThickness = 0.2
  const extraHeight = -1.5
  const totalHeight = (store.shelvesY * (store.gapY + shelfThickness)) + extraHeight
  const groundOffset = -0.75

  return (
    <mesh 
      position={[
        position[0], 
        groundOffset + (totalHeight/2),
        position[2]
      ]} 
      receiveShadow 
      castShadow
    >
      <boxGeometry args={[pillarWidth, totalHeight, pillarDepth]} />
      <meshStandardMaterial roughness={1} color={'#f97316'} />
    </mesh>
  )
}

export default function PillarSet({ rowIndex, shelvesCenterX, shelvesCenterZ }) {
  const store = useStore()
  const shelfWidth = 1.5

  // Prevent rendering extra set for drive layout's last position
  if (store.archetype === 'drive' && rowIndex >= store.shelvesZ) {
    return null;
  }

  // Update z-position calculation based on archetype
  const zPosition = store.archetype === 'drive'
    ? rowIndex * store.gapZ - shelvesCenterZ
    : (rowIndex % 2 === 0 ? 0 : store.gapZ) + 
      Math.floor(rowIndex / 2) * (store.backGap + store.gapZ) - 
      shelvesCenterZ;
      
  // Get the appropriate number of shelves for this row with fallback
  let rowLength = 0;
  
  if (rowIndex < store.shelvesXPerRow.length) {
    // Use specific value for this row
    rowLength = store.shelvesXPerRow[rowIndex];
  } else {
    // Use fallback values in priority order
    const lastRowLength = store.shelvesXPerRow[store.shelvesXPerRow.length - 1];
    const maxRowLength = Math.max(...store.shelvesXPerRow);
    rowLength = lastRowLength || maxRowLength || 10;
  }

  return (
    <group key={`pillars-${rowIndex}`}>
      {/* Start pillars */}
      <Pillar 
        position={[
          -shelvesCenterX - shelfWidth/2, 
          0, 
          zPosition - shelfWidth/2
        ]} 
      />
      <Pillar 
        position={[
          -shelvesCenterX - shelfWidth/2, 
          0, 
          zPosition + shelfWidth/2
        ]} 
      />
      
      {/* End pillars */}
      <Pillar 
        position={[
          -shelvesCenterX + (rowLength - 1) * store.gapX + shelfWidth/2, 
          0, 
          zPosition - shelfWidth/2
        ]} 
      />
      <Pillar 
        position={[
          -shelvesCenterX + (rowLength - 1) * store.gapX + shelfWidth/2, 
          0, 
          zPosition + shelfWidth/2
        ]} 
      />
    </group>
  )
}
