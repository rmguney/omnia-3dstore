import { create } from 'zustand'
import { apiData } from './mockAPI'

const useStore = create((set) => ({
  // Scene configuration
  shelvesX: apiData.shelvesX,
  shelvesY: apiData.shelvesY,
  shelvesZ: apiData.shelvesZ,
  gapX: 2,
  gapY: 2,
  gapZ: 7,
  pairGap: 1.2,
  
  // Box state
  boxData: apiData.boxData,
  selectedBox: null,

  // Camera state
  isFirstPerson: false,
  toggleCameraMode: () => set(state => ({ isFirstPerson: !state.isFirstPerson })),

  // Essential actions only
  setSelectedBox: (box) => set({ selectedBox: box }),
  toggleBoxPresence: () => {
    const { selectedBox, boxData } = useStore.getState()
    if (!selectedBox || !boxData) return
    const { x, y, z } = selectedBox
    const newData = [...boxData]
    newData[x][y][z].present = !newData[x][y][z].present
    set({ boxData: newData })
  },
  initializeBoxData: () => {
    const { shelvesX, shelvesY, shelvesZ } = useStore.getState()
    set({ 
      boxData: Array.from({ length: shelvesX }, () =>
        Array.from({ length: shelvesY }, () => 
          Array.from({ length: shelvesZ }, () => ({ present: true }))
        )
      )
    })
  },
  setDimensions: (dimensions) => set((state) => ({ ...state, ...dimensions })),
  setGaps: (gaps) => set((state) => ({ ...state, ...gaps })),
}))

export default useStore
