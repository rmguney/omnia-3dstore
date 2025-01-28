import { stores } from '../store/mockAPI'

export const generateTempBoxData = (shelvesY, shelvesZ, shelvesXPerRow, storeName) => {
  const boxData = [];
  const storeKey = storeName.includes('1') ? 'store1' : 
                   storeName.includes('2') ? 'store2' : 'store3';
  
  // Always get content from store1 since it has the full list
  let contentToUse = [...new Set(
    stores.store1.boxData.map(box => box.content)
  )];

  // If store2, reverse the content order
  if (storeKey === 'store2') {
    contentToUse.reverse();
  }

  if (storeKey === 'store3') {
    // For store3, first generate all boxes
    const allBoxes = [];
    for (let z = 0; z < shelvesZ; z++) {
      for (let y = 0; y < shelvesY; y++) {
        for (let x = 0; x < shelvesXPerRow[z]; x++) {
          const contentIndex = (x + y + z) % contentToUse.length;
          allBoxes.push({
            boxNumber: [x, y, z],
            content: contentToUse[contentIndex],
            present: true,
            priority: x, // Higher x means higher priority for removal
          });
        }
      }
    }

    // Sort boxes by x coordinate (descending) to prioritize removal of end boxes
    allBoxes.sort((a, b) => b.priority - a.priority);

    // Calculate how many boxes to remove (10%)
    const removeCount = Math.floor(allBoxes.length * 0.1);
    
    // Remove the priority boxes and add the rest to boxData
    const boxesToKeep = allBoxes.slice(removeCount);
    boxData.push(...boxesToKeep);

  } else {
    // Original logic for stores 1 and 2
    for (let z = 0; z < shelvesZ; z++) {
      const maxX = shelvesXPerRow[z];
      for (let y = 0; y < shelvesY; y++) {
        for (let x = 0; x < maxX; x++) {
          const seed = (x * 7919) + (y * 6037) + (z * 4721);
          if ((seed % 100) < 90) {
            const contentIndex = (x + y + z) % contentToUse.length;
            boxData.push({
              boxNumber: [x, y, z],
              content: contentToUse[contentIndex],
              present: true,
            });
          }
        }
      }
    }
  }

  return boxData;
};
