/**
 * API client for fetching warehouse data with fallback support
 */

// Primary and fallback API endpoints
const API_ENDPOINTS = {
  // Using our own proxy endpoint to avoid CORS issues
  proxy: "/api/proxy",
  // Keep original endpoints for testing only
  production: "https://onlineislemler.b2cargo.com/Omnia.Service/api/wh/GetPalletInfo",
  local: "https://onlineislemler.b2cargo.com/Omnia.Service/api/wh/GetPalletInfo"
};

/**
 * Maps API location code (A-1-1) to internal box number format [0,0,0]
 * @param {string} locationCode - Location code from API (e.g., "A-1-1")
 * @returns {Array} - Internal box number array [x,y,z]
 */
const mapLocationToBoxNumber = (locationCode) => {
  if (!locationCode || typeof locationCode !== 'string') {
    console.error('Invalid location code:', locationCode);
    return [0, 0, 0]; // Default fallback
  }

  try {
    const parts = locationCode.split('-');
    
    if (parts.length !== 3) {
      throw new Error(`Invalid location code format: ${locationCode}`);
    }
    
    // Extract components
    const section = parts[0];        // 'A', 'B', etc.
    const position = parseInt(parts[1], 10) - 1; // Convert to 0-based (API's second digit)
    const level = parseInt(parts[2], 10) - 1;    // Convert to 0-based (API's third digit)
    
    // Determine if this is in CRK-2 or CRK-1
    const isCRK2 = section >= 'I'; // I and beyond are CRK-2
    
    // Convert section letter to number with different indexing for each store
    let sectionNumber;
    if (isCRK2) {
      // For CRK-2, I becomes 0, J becomes 1, etc.
      sectionNumber = section.charCodeAt(0) - 'I'.charCodeAt(0);
    } else {
      // For CRK-1, A becomes 0, B becomes 1, etc. (unchanged)
      sectionNumber = section.charCodeAt(0) - 'A'.charCodeAt(0);
    }
    
    if (isNaN(position) || isNaN(level) || sectionNumber < 0) {
      throw new Error(`Invalid location components in: ${locationCode}`);
    }
    
    // Map according to corrected requirements:
    // x = position (second digit from API)
    // y = level (third digit from API)
    // z = section (first digit from API)
    return [position, level, sectionNumber];
  } catch (error) {
    console.error(`Error mapping location code ${locationCode}:`, error);
    return [0, 0, 0]; // Default fallback
  }
};

/**
 * Determines which store a pallet belongs to based on section code
 * @param {string} locationCode - Location code from API (e.g., "A-1-1")
 * @returns {string} - Store identifier ("CRK-2", "CRK-1", etc.)
 */
const determineStore = (locationCode) => {
  if (!locationCode || typeof locationCode !== 'string') return 'CRK-2';
  
  // Extract section letter
  const section = locationCode.charAt(0);
  
  // A to H is CRK-1 as specified (changed from I to H)
  if (section >= 'A' && section <= 'H') {
    return 'CRK-1';
  }
  
  // Default to CRK-2 for any other sections (including I and beyond)
  return 'CRK-2';
};

/**
 * Transforms API response to internal data format with optimized processing
 * @param {Array} apiData - Raw data from the API
 * @returns {Object} - Transformed data grouped by store
 */
const transformApiData = (apiData) => {
  if (!Array.isArray(apiData)) {
    console.error('API data is not an array:', apiData);
    return { 'CRK-2': [], 'CRK-1': [] };
  }
  
  // Pre-allocate arrays with estimated capacity
  const groupedData = {
    'CRK-2': [],
    'CRK-1': []
  };
  
  // Create a mapping cache to avoid redundant calculations
  const locationCache = {};
  
  apiData.forEach(item => {
    try {
      const locationCode = item.lokasyonKodu;
      
      // Use cached mapping if available
      if (!locationCache[locationCode]) {
        locationCache[locationCode] = {
          boxNumber: mapLocationToBoxNumber(locationCode),
          store: determineStore(locationCode)
        };
      }
      
      const { boxNumber, store } = locationCache[locationCode];
      
      const box = {
        boxNumber,
        content: item.stokCinsi || 'Unknown Item',
        present: true,
        
        // Essential display information
        displayLocation: locationCode || 'Unknown Location',
        
        // Only include essential data for rendering
        paletId: item.palet,
        customerName: item.cariAdi,
        quantity: item.toplam,
        
        // Include full data reference for detailed views
        _apiData: item,
        isFromApi: true
      };
      
      groupedData[store].push(box);
    } catch (error) {
      console.error('Error processing API item:', error);
    }
  });
  
  return groupedData;
};

/**
 * Fetch pallet data from API with fallback support
 * @param {string} depoKodu - Warehouse code
 * @returns {Promise<Object>} - Transformed data grouped by store
 */
export const fetchPalletData = async (depoKodu = 'CRK') => {
  // Try proxy endpoint first, as direct API calls will likely fail with CORS
  let apiData = null;
  let lastError = null;
  
  // First try the proxy (server-side request)
  try {
    const proxyUrl = `${API_ENDPOINTS.proxy}?depoKodu=${depoKodu}`;
    console.log(`Attempting to fetch data from proxy: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store' // Ensure fresh data
    });
    
    if (!response.ok) {
      throw new Error(`Proxy responded with status: ${response.status} ${response.statusText}`);
    }
    
    apiData = await response.json();
    console.log(`Successfully fetched ${apiData.length} pallets from proxy`);
  } catch (error) {
    console.error('Proxy request failed:', error);
    lastError = error;
    
    // Only if proxy fails, try direct endpoints (likely to fail due to CORS)
    const directEndpoints = [
      `${API_ENDPOINTS.production}?depoKodu=${depoKodu}`,
      `${API_ENDPOINTS.local}?depoKodu=${depoKodu}`
    ];
    
    for (const endpoint of directEndpoints) {
      try {
        console.log(`Attempting direct API request to: ${endpoint}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
          mode: 'cors', // Explicitly request CORS
          credentials: 'omit' // Don't send cookies
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status} ${response.statusText}`);
        }
        
        apiData = await response.json();
        console.log(`Successfully fetched ${apiData.length} pallets directly from ${endpoint}`);
        break;
      } catch (error) {
        console.warn(`Direct API request to ${endpoint} failed:`, error);
        lastError = error;
      }
    }
  }
  
  // If all requests failed, return empty data
  if (!apiData) {
    console.error('All API endpoints failed:', lastError);
    return { 'CRK-2': [], 'CRK-1': [] };
  }
  
  // Transform API data to our internal format
  return transformApiData(apiData);
};

/**
 * Fetch data using a script tag approach (JSONP-like) to bypass CORS
 * Only works in browser environments
 * @param {string} url - API endpoint
 * @returns {Promise<Object>} - API data
 */
const fetchWithScriptTag = (url) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject('Script tag approach only works in browser environments');
      return;
    }
    
    const callbackName = 'jsonpCallback' + Math.round(Math.random() * 1000000);
    const timeout = setTimeout(() => {
      reject(new Error('JSONP request timed out'));
      cleanup();
    }, 10000);
    
    // Create global callback function
    window[callbackName] = (data) => {
      resolve(data);
      cleanup();
    };
    
    function cleanup() {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window[callbackName];
      clearTimeout(timeout);
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = `${url}&callback=${callbackName}`;
    script.onerror = () => {
      reject(new Error('Script loading failed'));
      cleanup();
    };
    document.body.appendChild(script);
  });
};

/**
 * Test API connection via different endpoints
 * @returns {Object} - Status of each API endpoint tested
 */
export const testApiConnection = async () => {
  console.log('Testing API connection...');
  const results = { proxy: null, production: null };
  
  // Test the proxy endpoint
  try {
    console.log(`Testing proxy endpoint: ${API_ENDPOINTS.proxy}?depoKodu=CRK`);
    const proxyResponse = await fetch(`${API_ENDPOINTS.proxy}?depoKodu=CRK`);
    
    console.log(`Proxy status: ${proxyResponse.status} ${proxyResponse.statusText}`);
    results.proxy = proxyResponse.status;
    
    if (proxyResponse.ok) {
      const data = await proxyResponse.json();
      console.log(`Proxy returned ${data.length} items`);
    }
  } catch (error) {
    console.error('Proxy test failed:', error);
    results.proxy = error.message;
  }
  
  // Test direct endpoint (likely to fail due to CORS)
  try {
    console.log(`Testing direct API: ${API_ENDPOINTS.production}?depoKodu=CRK`);
    const directResponse = await fetch(`${API_ENDPOINTS.production}?depoKodu=CRK`);
    
    console.log(`Direct API status: ${directResponse.status} ${directResponse.statusText}`);
    results.production = directResponse.status;
  } catch (error) {
    console.error('Direct API test failed:', error);
    results.production = error.message;
  }
  
  console.log('API connection test summary:', results);
  return results;
};

// Make functions available in the global scope for debugging
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.fetchPalletData = fetchPalletData;
}
