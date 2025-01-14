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
  boxData: apiData.boxData || [],
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
  initializeBoxData: () => {
    set({ boxData: apiData.boxData })
  },
  setDimensions: (dimensions) => set((state) => ({ ...state, ...dimensions })),
  setGaps: (gaps) => set((state) => ({ ...state, ...gaps })),
}))

export default useStore
