/**
 * Server-side API proxy to bypass CORS restrictions
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const depoKodu = req.query.depoKodu || 'CRK';
  const apiUrl = `https://onlineislemler.b2cargo.com/Omnia.Service/api/wh/GetPalletInfo?depoKodu=${depoKodu}`;

  try {
    console.log(`Server-side proxy fetching: ${apiUrl}`);
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Proxy successfully fetched ${data.length} items`);
    
    // Send the data back to the client
    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data from API',
      message: error.message
    });
  }
}
