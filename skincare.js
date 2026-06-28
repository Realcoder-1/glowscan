export default async function handler(req, res) {
  // 1. Set CORS headers to allow requests from the mobile application
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are permitted.' });
  }

  // 2. Retrieve securely configured GEMINI_API_KEY from environment variables
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(500).json({ 
      error: 'GEMINI_API_KEY is not configured on the Vercel server. Please add GEMINI_API_KEY to your Vercel project Environment Variables.' 
    });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Gemini upstream API returned an error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ 
      error: 'Internal Server Error in GlowScan Vercel Proxy', 
      message: err.message 
    });
  }
}
