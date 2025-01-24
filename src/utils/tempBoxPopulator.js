import { stores } from '../store/mockAPI'

export const generateTempBoxData = (shelvesY, shelvesZ, shelvesXPerRow, storeName) => {
  const boxData = [];
  const storeKey = storeName.includes('1') ? 'store1' : 'store2';
  
  // Always get content from store1 since it has the full list
  let contentToUse = [...new Set(
    stores.store1.boxData.map(box => box.content)
  )];

  // If store2, reverse the content order
  if (storeKey === 'store2') {
    contentToUse.reverse();
  }

  for (let z = 0; z < shelvesZ; z++) {
    const maxX = shelvesXPerRow[z];
    for (let y = 0; y < shelvesY; y++) {
      for (let x = 0; x < maxX; x++) {
        const contentIndex = (x + y + z) % contentToUse.length;
        boxData.push({
          boxNumber: [x, y, z],
          content: contentToUse[contentIndex],
          present: ((x + y + z) % 3) !== 0,
        });
      }
    }
  }
  return boxData;
};
