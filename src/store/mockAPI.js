// This store is used to mimic the API only. It is not used in the final version of the project.
// it gets the number of shelves and what is inside the boxes from the api and sets the scene accordingly

export const apiData = {
  // Scene configuration
  shelvesX: 10, // Number of shelves in the X direction
  shelvesY: 3, // Number of shelves in the Y direction
  shelvesZ: 6, // Number of shelves in the Z direction

  // Box state data
  boxData: [
    { boxNumber: [0, 0, 0], content: 'Box 1' },
    { boxNumber: [1, 0, 0], content: 'Box 2' },
    { boxNumber: [3, 0, 0], content: 'Box 4' },
    { boxNumber: [4, 0, 0], content: 'Box 5' },
    { boxNumber: [0, 1, 0], content: 'Box 7' },
    { boxNumber: [1, 1, 0], content: 'Box 8' },
    { boxNumber: [2, 1, 0], content: 'Box 9' },
    { boxNumber: [3, 1, 0], content: 'Box 10' },
    { boxNumber: [4, 1, 0], content: 'Box 11' },
    { boxNumber: [5, 1, 0], content: 'Box 12' },
    { boxNumber: [0, 2, 0], content: 'Box 13' },
    { boxNumber: [1, 2, 0], content: 'Box 14' },
    { boxNumber: [2, 2, 0], content: 'Box 15' },
    { boxNumber: [3, 2, 0], content: 'Box 16' },
    { boxNumber: [4, 2, 0], content: 'Box 17' },
    { boxNumber: [5, 2, 0], content: 'Box 18' },
    { boxNumber: [0, 0, 1], content: 'Box 19' },
    { boxNumber: [1, 0, 1], content: 'Box 20' },
    { boxNumber: [2, 0, 1], content: 'Box 21' },
    { boxNumber: [3, 0, 1], content: 'Box 22' },
    { boxNumber: [4, 0, 1], content: 'Box 23' },
    { boxNumber: [5, 0, 1], content: 'Box 24' },
    { boxNumber: [0, 1, 1], content: 'Box 25' },
    { boxNumber: [1, 1, 1], content: 'Box 26' },
    { boxNumber: [2, 1, 1], content: 'Box 27' },
    { boxNumber: [3, 1, 1], content: 'Box 28' },
    { boxNumber: [4, 1, 1], content: 'Box 29' },
    { boxNumber: [5, 1, 1], content: 'Box 30' },
    // Add more boxes as needed
  ],
}

// Ensure apiData is updated when dimensions or gaps are changed
export const updateApiData = (key, value) => {
  apiData[key] = value
}