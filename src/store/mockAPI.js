// This store is used to mimic the API only. It is not used in the final version of the project.
// it gets the number of shelves and what is inside the boxes from the api and sets the scene accordingly

export const stores = {
  "CRK-1": {
    storeName: "Çerkezköy - 1",
    archetype: "back-to-back",
    shelvesY: 3,
    shelvesZ: 8,
    shelvesXPerRow: [27, 27, 27, 24, 27, 27, 27, 30],
    boxData: [
    ],
    loadingAreas: {
      frontLeft: {
        position: "frontLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5, // distance from the edge
        isMalKabul: false,
      },
      frontRight: {
        position: "frontRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
      },
      backLeft: {
        position: "backLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: false,
      },
      backRight: {
        position: "backRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
      }
    },
  },
  "CRK-2": {
    storeName: "Çerkezköy - 2",
    archetype: "back-to-back",
    shelvesY: 3,
    shelvesZ: 20,
    shelvesXPerRow: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    boxData: [
    ],
    loadingAreas: {
      frontLeft: {
        position: "frontLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5, // distance from the edge
        isMalKabul: false,
        boxes: [
        ]
      },
      frontRight: {
        position: "frontRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
        boxes: [

        ]
      },
      backLeft: {
        position: "backLeft",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: false,
        boxes: [

        ]
      },
      backRight: {
        position: "backRight",
        boxesX: 3,
        boxesY: 1,
        boxesZ: 4,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 5,
        isMalKabul: true,
        boxes: [

        ]
      }
    },
  },
  store3: {
    storeName: "Ferrero Demo",
    archetype: "drive",
    shelvesY: 5,
    shelvesZ: 12,
    shelvesXPerRow: [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    boxData: [
    ],
    loadingAreas: {
      frontRight: {
        position: "frontRight",
        boxesX: 4,
        boxesY: 1,
        boxesZ: 3,
        gapX: 1.51,
        gapY: 1.2,
        gapZ: 1.51,
        inset: 2, 
        isMalKabul: true,
        boxes: [
        ]
      }
    }
  }
}

// Ensure apiData is updated when dimensions or gaps are changed
export const updateApiData = (key, value) => {
  apiData[key] = value
}