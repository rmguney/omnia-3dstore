import { stores } from '../store/mockAPI'

export const generateTempBoxData = (shelvesY, shelvesZ, shelvesXPerRow, storeName) => {
  const storeKey = storeName.includes('1') ? 'store1' : 
                   storeName.includes('2') ? 'store2' : 'store3';

  // Get content list from store1
  let contentList = [...new Set(stores.store1.boxData.map(box => box.content))];
  if (storeKey === 'store2') contentList.reverse();

  const boxData = [];
  
  // Generate boxes based on store type
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
