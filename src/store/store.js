import { create } from 'zustand'
import { stores } from './mockAPI'
import { generateTempBoxData } from '../utils/tempBoxPopulator'

// populator version

const useStore = create((set) => ({
  // Scene configuration
  ...stores.store1,  // Default to store1
  gapX: 1.51,
  gapY: 2,
  gapZ: 9,
  backGap: 1.5,
  
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

  initializeBoxData: () => {
    const currentState = useStore.getState();
    const storeKey = currentState.storeName.includes('1') ? 'store1BoxData' : 'store2BoxData';
    
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
    // Save current box data to appropriate store
    const currentStoreKey = currentState.storeName.includes('1') ? 'store1BoxData' : 'store2BoxData';
    const updatedState = {
      ...stores[storeKey],
      [currentStoreKey]: currentState.boxData
    };
    
    // Set the box data for the new store
    const newStoreKey = storeKey === 'store1' ? 'store1BoxData' : 'store2BoxData';
    updatedState.boxData = currentState[newStoreKey] || null;
    
    set(updatedState);
    
    // Initialize box data if not already present
    if (!updatedState.boxData) {
      useStore.getState().initializeBoxData();
    }
  },
}))

export default useStore