import { create } from 'zustand'
import { stores } from './mockAPI'
import { fetchPalletData } from '../utils/apiClient'

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
  selectedStore: 'CRK-2',
  ...stores['CRK-2'],
  ...archetypeConfigs['back-to-back'],

  // Box state
  selectedBox: null,
  focusedBox: null,
  
  // API state
  isLoading: false,
  hasApiError: false,
  apiErrorMessage: null,
  
  // Flag to force using mock data (for debugging)
  useMockData: false,
  
  // Add flag to track API request in progress
  isApiRequestInProgress: false,

  // Camera state
  isFirstPerson: false,
  toggleCameraMode: () => set(state => ({ isFirstPerson: !state.isFirstPerson })),

  // Modified to work with dynamic dimensions from API data
  initializeBoxData: async () => {
    const state = get();
    
    // Prevent multiple simultaneous API calls
    if (state.isApiRequestInProgress) {
      console.log('API request already in progress, skipping');
      return;
    }
    
    // Set loading flag
    set({
      isApiRequestInProgress: true,
      isLoading: true,
      hasApiError: false,
      apiErrorMessage: null
    });
    
    // Make sure we're using the correct store's configuration
    const currentStore = stores[state.selectedStore];
    
    // Update state with current store's configuration
    set({
      ...currentStore,
      ...archetypeConfigs[currentStore.archetype],
    });
    
    // Initialize loading areas with empty boxes if needed
    const loadingAreas = {};
    
    if (currentStore.loadingAreas) {
      Object.entries(currentStore.loadingAreas).forEach(([key, config]) => {
        loadingAreas[key] = {
          ...config,
          boxes: config.boxes || []  // Use existing boxes or empty array
        };
      });
    }
    
    // Try to fetch real data from API (unless we're forcing mock data)
    if (!state.useMockData) {
      try {
        const apiData = await fetchPalletData('CRK');
        
        // If we got data for the selected store, use it
        if (apiData[state.selectedStore]?.length > 0) {
          // Apply dynamic dimensions from API data if available
          let dynamicConfig = {};
          
          if (apiData.dimensions && apiData.dimensions[state.selectedStore]) {
            const storeDimensions = apiData.dimensions[state.selectedStore];
            
            // Only apply dimensions if they are valid and reasonable
            if (storeDimensions.maxY > 0 && storeDimensions.maxZ > 0) {
              console.log(`Applying dynamic dimensions for ${state.selectedStore}:`, storeDimensions);
              
              dynamicConfig = {
                shelvesY: storeDimensions.maxY,
                shelvesZ: storeDimensions.maxZ
              };
              
              // Only apply shelvesXPerRow if it's a valid array with content
              if (Array.isArray(storeDimensions.shelvesXPerRow) && 
                  storeDimensions.shelvesXPerRow.length > 0) {
                dynamicConfig.shelvesXPerRow = storeDimensions.shelvesXPerRow;
              }
            }
          }
          
          set({ 
            ...dynamicConfig, // Apply dynamic dimensions first
            boxData: apiData[state.selectedStore],
            isLoading: false,
            isApiRequestInProgress: false
          });
          console.log(`Using API data for ${state.selectedStore}: ${apiData[state.selectedStore].length} pallets found`);
          
          // Handle non-standard location boxes for mal kabul areas
          if (apiData.malKabulBoxes?.length > 0) {
            console.log(`Found ${apiData.malKabulBoxes.length} non-standard location boxes for mal kabul areas`);
            
            // Filter to only boxes for the current store
            const relevantMalKabulBoxes = apiData.malKabulBoxes.filter(box => 
              box.store === state.selectedStore
            );
            
            if (relevantMalKabulBoxes.length > 0) {
              // Find all mal kabul loading areas
              const malKabulAreas = Object.entries(loadingAreas)
                .filter(([key, area]) => area.isMalKabul === true)
                .map(([key]) => key);
              
              if (malKabulAreas.length > 0) {
                // Distribute boxes among mal kabul areas
                relevantMalKabulBoxes.forEach((box, index) => {
                  // Pick a mal kabul area in round-robin fashion
                  const areaKey = malKabulAreas[index % malKabulAreas.length];
                  const area = loadingAreas[areaKey];
                  
                  // Find an empty spot in the area
                  for (let y = 0; y < area.boxesY; y++) {
                    for (let z = 0; z < area.boxesZ; z++) {
                      for (let x = 0; x < area.boxesX; x++) {
                        // Check if this position is already occupied
                        const isOccupied = area.boxes.some(existingBox => 
                          existingBox.boxNumber[0] === x && 
                          existingBox.boxNumber[1] === y && 
                          existingBox.boxNumber[2] === z
                        );
                        
                        if (!isOccupied) {
                          // Add box to this position
                          area.boxes.push({
                            ...box,
                            boxNumber: [x, y, z],
                            content: `${box.content || 'Unknown'} (${box.originalLocation || 'Non-Std'})`
                          });
                          return; // Exit the loops after placing the box
                        }
                      }
                    }
                  }
                });
                
                console.log(`Distributed ${relevantMalKabulBoxes.length} non-standard boxes to mal kabul areas`);
              } else {
                console.log(`No mal kabul areas found for non-standard boxes in ${state.selectedStore}`);
              }
            }
          }
        } else {
          // If API returned empty data for this store, use the empty boxData from mockAPI
          console.log(`No API data for ${state.selectedStore}, using empty box data`);
          set({ 
            boxData: currentStore.boxData || [],
            isLoading: false,
            isApiRequestInProgress: false
          });
        }
      } catch (error) {
        console.error('Error fetching pallet data:', error);
        
        // On error, use empty boxData from mockAPI
        set({ 
          boxData: currentStore.boxData || [],
          isLoading: false,
          isApiRequestInProgress: false,
          hasApiError: true,
          apiErrorMessage: `Failed to fetch data: ${error.message}`
        });
      }
    } else {
      // Use mock data directly if forced
      set({ 
        boxData: currentStore.boxData || [], 
        isLoading: false,
        isApiRequestInProgress: false 
      });
      console.log('Using mock data (forced)');
    }
    
    set({ loadingAreas });
  },

  // Toggle mock data usage (for debugging)
  toggleMockData: () => set(state => ({ useMockData: !state.useMockData })),

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
    // Clear out old data before setting the new store
    set({ 
      selectedStore: storeKey,
      boxData: [], // Clear box data to prevent overlaps
      focusedBox: null, // Reset focused box
      selectedBox: null, // Reset selected box
      isApiRequestInProgress: false // Reset API request state
    });
    
    // Then initialize the new store's data
    const state = get();
    state.initializeBoxData();
  },
  
  // Add visibility state for culling
  visibilityConfig: {
    frustumCulling: true,
    cullingDistance: 30,
    lodDistance: 15
  },
  
  setVisibilityConfig: (config) => set(state => ({
    visibilityConfig: {
      ...state.visibilityConfig,
      ...config
    }
  })),
  
  // Helper to determine if a position should be rendered based on camera
  isInFrustum: (position, camera) => {
    if (!camera || !get().visibilityConfig.frustumCulling) return true;
    
    // Simple distance-based culling
    const distanceSquared = 
      Math.pow(position[0] - camera.position.x, 2) +
      Math.pow(position[1] - camera.position.y, 2) +
      Math.pow(position[2] - camera.position.z, 2);
      
    return distanceSquared <= Math.pow(get().visibilityConfig.cullingDistance, 2);
  },
}));

export default useStore;