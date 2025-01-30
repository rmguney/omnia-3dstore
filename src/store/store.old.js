import { create } from 'zustand'
import { stores } from './mockAPI'

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
  initializeBoxData: () => {
    set({ boxData: stores.store1.boxData })
  },
  setDimensions: (dimensions) => set((state) => ({ ...state, ...dimensions })),
  setGaps: (gaps) => set((state) => ({ ...state, ...gaps })),
  setShelvesXPerRow: (shelvesXPerRow) => set({ shelvesXPerRow }),
  switchStore: (storeKey) => set(stores[storeKey]),
}))

export default useStore