import { create } from 'zustand'
import { stores } from './mockAPI'
import { generateTempBoxData } from '../utils/tempBoxPopulator'

// Define archetype-specific configurations
const archetypeConfigs = {
  'back-to-back': {
    gapX: 1.51,
    gapY: 2,
    gapZ: 9,
    backGap: 1.5,
    widthOffset: 40,
    depthOffset: 2,
  },
  'drive': {
    gapX: 1.51,
    gapY: 2,
    gapZ: 1.51,
    backGap: 0,
    widthOffset: 40,
    depthOffset: 2,
  }
};

const useStore = create((set, get) => ({
  // Scene configuration
  ...stores.store1,  // Default to store1
  ...archetypeConfigs['back-to-back'],  // Default gaps
  
  // Box state
  selectedBox: null,
  focusedBox: null,

  // Camera state
  isFirstPerson: false,
  toggleCameraMode: () => set(state => ({ isFirstPerson: !state.isFirstPerson })),

  // Essential actions
  initializeBoxData: () => {
    const state = get();
    if (!state.boxData || state.boxData.length === 0) {
      const tempBoxData = generateTempBoxData(
        state.shelvesY,
        state.shelvesZ,
        state.shelvesXPerRow,
        state.storeName
      );
      set({ boxData: tempBoxData });
    }
  },

  setSelectedBox: (box) => set({ selectedBox: box }),
  setFocusedBox: (boxNumber) => {
    const state = get();
    const box = state.boxData?.find(b => 
      b.boxNumber[0] === boxNumber[0] && 
      b.boxNumber[1] === boxNumber[1] && 
      b.boxNumber[2] === boxNumber[2]
    );
    set({ 
      focusedBox: box,
      selectedBox: { x: boxNumber[0], y: boxNumber[1], z: boxNumber[2] }
    });
  },
  clearFocusedBox: () => set({ focusedBox: null }),

  // Basic setters
  setDimensions: (dimensions) => set((state) => ({ ...state, ...dimensions })),
  setGaps: (gaps) => set((state) => ({ ...state, ...gaps })),
  setShelvesXPerRow: (shelvesXPerRow) => set({ shelvesXPerRow }),
  
  setArchetype: (archetype) => {
    const config = archetypeConfigs[archetype];
    set(state => ({ 
      ...state,
      archetype,
      ...config,
    }));
  },

  // Add method to update offsets
  setOffsets: (offsets) => set(state => ({ ...state, ...offsets })),

  // Store switching
  switchStore: (storeKey) => {
    const newStoreConfig = {
      ...stores[storeKey],
      ...archetypeConfigs[stores[storeKey].archetype],
    };
    set(newStoreConfig);
    
    // Initialize box data after switching store
    const state = get();
    if (!newStoreConfig.boxData || newStoreConfig.boxData.length === 0) {
      state.initializeBoxData();
    }
  }
}));

export default useStore