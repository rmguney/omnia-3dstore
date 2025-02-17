import { stores } from '../store/mockAPI'

const generateLoadingAreaBoxes = (config, contentList, storeKey) => {
  const boxes = [];
  const prefix = storeKey === 'store3' ? 'DRIVE PALET - ' : 'PALETLI STOK - ';
  let boxCount = 0;
  
  // Fill boxes floor by floor
  for (let y = 0; y < config.boxesY; y++) {
    // Fill each floor row by row
    for (let z = 0; z < config.boxesZ; z++) {
      // Fill each row completely
      for (let x = 0; x < config.boxesX; x++) {
        // Use seed-based random selection for 70% fill rate
        const seed = (x * 7919) + (y * 6037) + (z * 4721);
        if ((seed % 100) < 70) {
          const contentIndex = boxCount % contentList.length;
          boxes.push({
            boxNumber: [x, y, z], // This maintains the physical position
            content: prefix + contentList[contentIndex],
            boxId: boxCount + 1 // This gives sequential numbering
          });
          boxCount++;
        }
      }
    }
  }
  return boxes;
};

export const generateTempBoxData = (shelvesY, shelvesZ, shelvesXPerRow, storeName) => {
  const storeKey = storeName.includes('1') ? 'store1' : 
                   storeName.includes('2') ? 'store2' : 'store3';

  // Get content list from store1
  let contentList = [...new Set(stores.store1.boxData.map(box => box.content))];
  if (storeKey === 'store2') contentList.reverse();

  const boxData = [];
  
  // Generate shelving boxes
  for (let z = 0; z < shelvesZ; z++) {
    for (let y = 0; y < shelvesY; y++) {
      for (let x = 0; x < shelvesXPerRow[z]; x++) {
        // For store3, remove 10% from the end of rows
        if (storeKey === 'store3' && x >= Math.floor(shelvesXPerRow[z] * 0.90)) {
          continue;
        }
        
        // For store1 and store2, use deterministic random removal
        if (storeKey !== 'store3') {
          const seed = (x * 7919) + (y * 6037) + (z * 4721);
          if ((seed % 100) >= 90) continue;
        }

        const contentIndex = (x + y + z) % contentList.length;
        boxData.push({
          boxNumber: [x, y, z],
          content: contentList[contentIndex],
          present: true
        });
      }
    }
  }
  
  return boxData;
};

export const generateLoadingAreas = (loadingAreas, storeName) => {
  const storeKey = storeName.includes('1') ? 'store1' : 
                   storeName.includes('2') ? 'store2' : 'store3';
                   
  const contentList = [...new Set(stores.store1.boxData.map(box => box.content))];
  const result = {};

  Object.entries(loadingAreas).forEach(([key, config]) => {
    if (!config.boxes || config.boxes.length === 0) {
      result[key] = {
        ...config,
        boxes: generateLoadingAreaBoxes(config, contentList, storeKey)
      };
    } else {
      result[key] = config;
    }
  });

  return result;
};
