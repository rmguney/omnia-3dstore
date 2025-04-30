import useStore from '@/store/store'
import Box from './Box'

export default function LoadingArea({ config, planeWidth, planeDepth, offsetX, offsetZ, onPointerOver, onPointerOut }) {
  const getPosition = () => {
    const margin = 1.0; // reduced margin to be closer to border
    const x = config.position.includes('Right') 
      ? planeWidth/2 - margin - (config.boxesX * config.gapX)/2 + offsetX
      : -planeWidth/2 + margin + (config.boxesX * config.gapX)/2 + offsetX;
    
    const z = config.position.includes('back') 
      ? planeDepth/2 - margin - (config.boxesZ * config.gapZ)/2 + offsetZ
      : -planeDepth/2 + margin + (config.boxesZ * config.gapZ)/2 + offsetZ;

    return [x, 0, z];
  }

  const [x, y, z] = getPosition();

  // Create positions array for all possible box positions
  const positions = [];
  let currentId = 1;

  // Fill positions in correct order: X → Z → Y
  for (let py = 0; py < config.boxesY; py++) {
    for (let pz = 0; pz < config.boxesZ; pz++) {
      for (let px = 0; px < config.boxesX; px++) {
        positions.push({
          pos: [px, py, pz],
          id: currentId++
        });
      }
    }
  }

  const store = useStore();

  return (
    <group position={[x, y, z]}>
      {positions.map(({ pos: [px, py, pz], id }) => {
        // [0,0,0] is always at the corner
        const adjustedPx = config.position.includes('Right') 
          ? (config.boxesX - 1) - px
          : px;
          
        const adjustedPz = config.position.includes('back') 
          ? (config.boxesZ - 1) - pz
          : pz;
          
        const box = config.boxes?.find(b => 
          b.boxNumber[0] === px && 
          b.boxNumber[1] === py && 
          b.boxNumber[2] === pz
        );
        
        if (!box) return null;

        return (
          <Box
            key={`loading-${config.position}-${px}-${py}-${pz}`}
            position={[
              (adjustedPx - (config.boxesX - 1)/2) * config.gapX,
              py * config.gapY,
              (adjustedPz - (config.boxesZ - 1)/2) * config.gapZ
            ]}
            content={`${box.content} (${id})`}
            boxNumber={[px, py, pz]}
            fullData={box}
            isNonStandardLocation={box.isNonStandardLocation || false}
            onClick={() => store.setFocusedBox([px, py, pz], true, config.position)}
            onPointerOver={() => onPointerOver(box.content, [px, py, pz], box)}
            onPointerOut={onPointerOut}
            isSelected={store.selectedBox && 
              store.selectedBox.isLoadingArea &&
              store.selectedBox.areaKey === config.position &&
              store.selectedBox.x === px &&
              store.selectedBox.y === py &&
              store.selectedBox.z === pz}
          />
        );
      })}
    </group>
  );
}
