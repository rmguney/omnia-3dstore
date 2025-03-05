/**
 * Calculates plane dimensions based on shelf configuration
 * @param {Object} config - The storage configuration
 * @returns {Object} Dimensions and offset values for the plane
 */
export const calculatePlaneDimensions = (config) => {
  const {
    shelvesXPerRow,
    gapX,
    widthOffsetStart,
    widthOffsetEnd,
    shelvesZ,
    gapZ,
    depthOffsetStart,
    depthOffsetEnd,
    archetype,
    backGap
  } = config;

  const shelfWidth = Math.max(...shelvesXPerRow) * gapX;
  const totalWidth = shelfWidth + widthOffsetStart + widthOffsetEnd;
  
  if (archetype === 'drive') {
    const totalDepth = shelvesZ * gapZ + depthOffsetStart + depthOffsetEnd;
    return {
      width: totalWidth,
      depth: totalDepth,
      offsetX: (widthOffsetEnd - widthOffsetStart) / 2,
      offsetZ: (depthOffsetEnd - depthOffsetStart) / 2
    };
  } else {
    const backToBackDepth = gapZ + backGap;
    const totalPairsDepth = Math.ceil(shelvesZ / 2) * backToBackDepth;
    const totalDepth = totalPairsDepth + depthOffsetStart + depthOffsetEnd;
    return {
      width: totalWidth,
      depth: totalDepth,
      offsetX: (widthOffsetEnd - widthOffsetStart) / 2,
      offsetZ: (depthOffsetEnd - depthOffsetStart) / 2
    };
  }
};

/**
 * Calculates center positions for shelves layout
 * @param {Object} config - The storage configuration
 * @returns {Object} Center X and Z positions
 */
export const calculateShelvesCenter = (config) => {
  const { 
    shelvesXPerRow, 
    gapX, 
    shelvesZ, 
    gapZ, 
    archetype, 
    backGap 
  } = config;
  
  return {
    shelvesCenterX: (Math.max(...shelvesXPerRow) - 1) * gapX / 2,
    shelvesCenterZ: archetype === 'drive'
      ? (shelvesZ - 1) * gapZ / 2
      : Math.ceil(shelvesZ / 2) * (gapZ + backGap) / 2
  };
};

/**
 * Creates a function to calculate Z positions based on row index
 * @param {string} archetype - The storage archetype ('drive' or other)
 * @param {number} gapZ - Gap between shelves in Z direction
 * @param {number} backGap - Gap between back-to-back shelves
 * @param {number} shelvesCenterZ - Center Z position for shelves
 * @returns {Function} Function that calculates Z position for a given row
 */
export const createZPositionCalculator = (archetype, gapZ, backGap, shelvesCenterZ) => {
  return (z) => {
    if (archetype === 'drive') {
      return z * gapZ - shelvesCenterZ;
    }
    return ((z % 2 === 0 ? 0 : gapZ) + 
            Math.floor(z / 2) * (backGap + gapZ)) - shelvesCenterZ;
  };
};

/**
 * Creates a lookup map for boxes to improve performance
 * @param {Array} boxData - Array of box objects
 * @returns {Object} Lookup map keyed by box coordinates
 */
export const createBoxLookup = (boxData) => {
  const lookup = {};
  boxData.forEach(box => {
    const [x, y, z] = box.boxNumber;
    lookup[`${x}-${y}-${z}`] = box;
  });
  return lookup;
};
