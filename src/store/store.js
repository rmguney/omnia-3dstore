import { create } from 'zustand'

const useStore = create((set) => ({
  // Shelf dimensions
  shelvesX: 6,
  shelvesY: 3,
  shelvesZ: 6,
  
  // Gaps
  gapX: 2,
  gapY: 2,
  gapZ: 7,
  pairGap: 1.2,
  
  // Box data
  boxData: null,
  selectedBox: null,

  // Actions
  setDimensions: (dimensions) => set(dimensions),
  setGaps: (gaps) => set(gaps),
  
  initializeBoxData: () => {
    const { shelvesX, shelvesY, shelvesZ } = useStore.getState()
    const boxData = Array.from({ length: shelvesX }, () =>
      Array.from({ length: shelvesY }, () => 
        Array.from({ length: shelvesZ }, () => ({ present: true }))
      )
    )
    set({ boxData })
  },

  setSelectedBox: (box) => set({ selectedBox: box }),

  toggleBoxPresence: () => {
    const { selectedBox, boxData } = useStore.getState()
    if (selectedBox) {
      const { x, y, z } = selectedBox
      const newData = boxData.map((planeX, i) =>
        planeX.map((planeY, j) =>
          planeY.map((box, k) =>
            i === x && j === y && k === z ? { present: !box.present } : box
          )
        )
      )
      set({ boxData: newData })
    }
  }
}))

export default useStore
