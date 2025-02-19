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
  // Scene configuration - explicitly set all default values
  selectedStore: 'store1',
  ...stores.store1,
  ...archetypeConfigs['back-to-back'],

  // Box state
  selectedBox: null,
  focusedBox: null,

  // Camera state
  isFirstPerson: false,
  toggleCameraMode: () => set(state => ({ isFirstPerson: !state.isFirstPerson })),

  // Essential actions
  initializeBoxData: () => {
    const state = get();
    
    // Make sure we're using the correct store's configuration
    const currentStore = stores[state.selectedStore];
    
    // Update state with current store's configuration
    set({
      ...currentStore,
      ...archetypeConfigs[currentStore.archetype],
    });
    
    // Initialize box data and loading areas
    const loadingAreas = currentStore.loadingAreas ? 
      generateLoadingAreas(currentStore.loadingAreas, currentStore.storeName) : 
      {};
    
    const boxData = (!currentStore.boxData || currentStore.boxData.length === 0) 
      ? generateTempBoxData(
          currentStore.shelvesY,
          currentStore.shelvesZ,
          currentStore.shelvesXPerRow,
          currentStore.storeName
        )
      : currentStore.boxData;

    set({ loadingAreas, boxData });
  },

  setSelectedBox: (box) => set({ selectedBox: box }),

  // Add new state for loading area visibility
  showLoadingAreaBoxes: false,
  toggleLoadingAreaBoxes: () => set(state => ({ showLoadingAreaBoxes: !state.showLoadingAreaBoxes })),

  // Update setFocusedBox to handle loading area boxes
  setFocusedBox: (boxNumber, isLoadingArea = false, areaKey = null) => {
    const state = get();
    let box;

    if (isLoadingArea && areaKey) {
      // Get box from specific loading area
      box = state.loadingAreas[areaKey].boxes?.find(b =>
        b.boxNumber[0] === boxNumber[0] && 
        b.boxNumber[1] === boxNumber[1] && 
        b.boxNumber[2] === boxNumber[2]
      );
      if (box) {
        box = {
          ...box,
          isLoadingArea: true,
          areaKey
        };
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
      selectedBox: box ? { 
        x: boxNumber[0], 
        y: boxNumber[1], 
        z: boxNumber[2],
        isLoadingArea,
        areaKey
      } : null
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
    set({ selectedStore: storeKey });
    const state = get();
    state.initializeBoxData();
  },
}));

export default useStore