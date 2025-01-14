// This store is used to mimic the API only. It is not used in the final version of the project.
// it gets the number of shelves and what is inside the boxes from the api and sets the scene accordingly

export const apiData = {
    // Scene configuration
    shelvesX: 6, // Number of shelves in the X direction
    shelvesY: 3, // Number of shelves in the Y direction
    shelvesZ: 6, // Number of shelves in the Z direction
  
    // Box state data
    boxData: Array.from({ length: 6 }, () => // Matches shelvesX
      Array.from({ length: 3 }, () => // Matches shelvesY
        Array.from({ length: 6 }, () => ({ present: true })) // Matches shelvesZ
      )
    ),
  };

// Ensure apiData is updated when dimensions or gaps are changed
export const updateApiData = (key, value) => {
  apiData[key] = value
}