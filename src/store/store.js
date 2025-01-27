import { create } from 'zustand'
import { stores } from './mockAPI'
import { generateTempBoxData } from '../utils/tempBoxPopulator'

// Define store-specific configurations
const storeConfigs = {
  store1: {
    gapX: 1.51,
    gapY: 2,
    gapZ: 9,
    backGap: 1.5,
  },
  store2: {
    gapX: 1.51,
    gapY: 2,
    gapZ: 9,
    backGap: 1.5,
  },
  store3: {
    gapX: 1.51,
    gapY: 2,
    gapZ: 1.51,
    backGap: 1.51,
  }
}

const useStore = create((set) => ({
  // Scene configuration
  ...stores.store1,  // Default to store1
  ...storeConfigs.store1,  // Default gaps for store1
  
  // Box state
  selectedBox: null,

  // Camera state
  isFirstPerson: false,
  toggleCameraMode: () => set(state => ({ isFirstPerson: !state.isFirstPerson })),

  // Essential actions only
  setSelectedBox: (box) => set({ selectedBox: box }),
  toggleBoxPresence: () => {
    const { selectedBox, boxData } = useStore.getState()
    if (!selectedBox || !boxData) return
    const boxIndex = boxData.findIndex(box => 
      box.boxNumber && 
      box.boxNumber[0] === selectedBox.x && 
      box.boxNumber[1] === selectedBox.y && 
      box.boxNumber[2] === selectedBox.z
    )
    if (boxIndex === -1) return
    const newData = [...boxData]
    newData[boxIndex].present = !newData[boxIndex].present
    set({ boxData: newData })
  },

  // Add storage for each store's box data
  store1BoxData: null,
  store2BoxData: null,
  store3BoxData: null,

  initializeBoxData: () => {
    const currentState = useStore.getState();
    let storeKey;
    
    if (currentState.storeName.includes('1')) {
      storeKey = 'store1BoxData';
    } else if (currentState.storeName.includes('2')) {
      storeKey = 'store2BoxData';
    } else {
      storeKey = 'store3BoxData';
    }
    
    // Only generate if not already initialized
    if (!currentState[storeKey]) {
      const tempBoxData = generateTempBoxData(
        currentState.shelvesY,
        currentState.shelvesZ,
        currentState.shelvesXPerRow,
        currentState.storeName // Pass store name to generator
      );
      set({ 
        [storeKey]: tempBoxData,
        boxData: tempBoxData
      });
    } else {
      set({ boxData: currentState[storeKey] });
    }
  },

  setDimensions: (dimensions) => set((state) => ({ ...state, ...dimensions })),
  setGaps: (gaps) => set((state) => ({ ...state, ...gaps })),
  setShelvesXPerRow: (shelvesXPerRow) => set({ shelvesXPerRow }),
  switchStore: (storeKey) => {
    const currentState = useStore.getState();
    // Determine current store key
    let currentStoreKey;
    if (currentState.storeName.includes('1')) {
      currentStoreKey = 'store1BoxData';
    } else if (currentState.storeName.includes('2')) {
      currentStoreKey = 'store2BoxData';
    } else {
      currentStoreKey = 'store3BoxData';
    }
    
    const updatedState = {
      ...stores[storeKey],
      ...storeConfigs[storeKey],  // Apply store-specific gaps
      [currentStoreKey]: currentState.boxData
    };
    
    // Set the box data for the new store
    const newStoreKey = `${storeKey}BoxData`;
    updatedState.boxData = currentState[newStoreKey] || null;
    
    set(updatedState);
    
    // Initialize box data if not already present
    if (!updatedState.boxData) {
      useStore.getState().initializeBoxData();
    }
  },

  // Add new state for focused box
  focusedBox: null,
  
  // Add method to set focused box
  setFocusedBox: (boxNumber) => {
    const state = useStore.getState();
    const box = state.boxData.find(b => 
      b.boxNumber[0] === boxNumber[0] && 
      b.boxNumber[1] === boxNumber[1] && 
      b.boxNumber[2] === boxNumber[2]
    );
    set({ 
      focusedBox: box,
      selectedBox: { x: boxNumber[0], y: boxNumber[1], z: boxNumber[2] }
    });
  },
  
  // Add method to clear focused box
  clearFocusedBox: () => set({ focusedBox: null }),
}))

export default useStore