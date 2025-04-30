/**
 * Utility for managing memory and preventing WebGL context loss
 */

// Track disposable objects that need cleanup
const disposables = new Set();

/**
 * Register an object for disposal when appropriate
 * @param {Object} object - Three.js object with .dispose() method
 * @param {string} name - Optional name for debugging
 */
export const registerDisposable = (object, name = 'unnamed') => {
  if (!object || typeof object.dispose !== 'function') {
    console.warn(`Cannot register object "${name}" for disposal - no dispose method`);
    return;
  }
  
  disposables.add({
    object,
    name,
    timestamp: Date.now()
  });
};

/**
 * Clean up disposable objects
 * @param {boolean} forceAll - Force cleanup of all objects, not just old ones
 */
export const cleanupDisposables = (forceAll = false) => {
  const now = Date.now();
  const oldThreshold = 5 * 60 * 1000; // 5 minutes
  
  disposables.forEach(item => {
    // Dispose if forced or if object is old
    if (forceAll || (now - item.timestamp > oldThreshold)) {
      try {
        item.object.dispose();
        console.log(`Disposed ${item.name}`);
        disposables.delete(item);
      } catch (error) {
        console.error(`Error disposing ${item.name}:`, error);
      }
    }
  });
};

/**
 * Cleanup when switching stores
 */
export const cleanupOnStoreSwitch = () => {
  // Force garbage collection if browser allows it
  if (window.gc) {
    window.gc();
  }
  
  // Run cleanup
  cleanupDisposables(true);
};

export default {
  registerDisposable,
  cleanupDisposables,
  cleanupOnStoreSwitch
};
