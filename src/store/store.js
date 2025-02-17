import { create } from 'zustand'
import { stores } from './mockAPI'
import { generateTempBoxData, generateLoadingAreas } from '../utils/tempBoxPopulator'

// Define archetype-specific configurations
const archetypeConfigs = {
  'back-to-back': {
    gapX: 1.51,
    gapY: 2,
    gapZ: 9,
    backGap: 1.5,
    widthOffsetStart: 15,
    widthOffsetEnd: 15,
    depthOffsetStart: 1,
    depthOffsetEnd: -0.5,
  },
  'drive': {
    gapX: 1.51,
    gapY: 2,
    gapZ: 1.51,
    backGap: 0,
    widthOffsetStart: 0.5,
    widthOffsetEnd: 15,
    depthOffsetStart: 0.5,
    depthOffsetEnd: 0.5,
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
    
    // Initialize both box data and loading areas immediately
    const loadingAreas = state.loadingAreas ? generateLoadingAreas(state.loadingAreas, state.storeName) : {};
    const boxData = (!state.boxData || state.boxData.length === 0) 
      ? generateTempBoxData(state.shelvesY, state.shelvesZ, state.shelvesXPerRow, state.storeName)
      : state.boxData;

    set({ loadingAreas, boxData });
  },

  setSelectedBox: (box) => set({ selectedBox: box }),

  // Add new state for loading area visibility
  showLoadingAreaBoxes: false,
  toggleLoadingAreaBoxes: () => set(state => ({ showLoadingAreaBoxes: !state.showLoadingAreaBoxes })),

  // Update setFocusedBox to handle loading area boxes
  setFocusedBox: (boxNumber, isLoadingArea = false) => {
    const state = get();
    let box;

    if (isLoadingArea) {
      // Search in loading areas
      for (const area of Object.values(state.loadingAreas)) {
        box = area.boxes?.find(b =>
          b.boxNumber[0] === boxNumber[0] && 
          b.boxNumber[1] === boxNumber[1] && 
          b.boxNumber[2] === boxNumber[2]
        );
        if (box) break;
      }
    } else {
      // Search in regular boxes
      box = state.boxData?.find(b => 
        b.boxNumber[0] === boxNumber[0] && 
        b.boxNumber[1] === boxNumber[1] && 
        b.boxNumber[2] === boxNumber[2]
      );
    }

    set({ 
      focusedBox: box,
      selectedBox: box ? { x: boxNumber[0], y: boxNumber[1], z: boxNumber[2] } : null
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

  // Loading area configuration
  loadingAreas: {},
  
  setLoadingAreaConfig: (areaId, config) => set(state => ({
    loadingAreas: {
      ...state.loadingAreas,
      [areaId]: {
        ...state.loadingAreas[areaId],
        ...config
      }
    }
  })),

  // Store switching
  switchStore: (storeKey) => {
    const newStoreConfig = {
      ...stores[storeKey],
      ...archetypeConfigs[stores[storeKey].archetype],
    };
    set(newStoreConfig);
    
    // Initialize immediately after setting new config
    const state = get();
    state.initializeBoxData();
  }
}));

export default useStore