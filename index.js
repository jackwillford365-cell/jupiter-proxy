const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json());

const JUPITER_API = 'https://quote-api.jup.ag/v6';

function httpsFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'SolSniper-Proxy/1.0',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SolSniper Jupiter Proxy', version: '2.0' });
});

app.get('/jupiter/quote', async (req, res) => {
  try {
    const params = new URLSearchParams(req.query).toString();
    const url = `${JUPITER_API}/quote?${params}`;
    console.log('Fetching quote:', url);
    
    const response = await httpsFetch(url);
    const data = await response.text();
    
    console.log('Quote response status:', response.status);
    res.set('Content-Type', 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Quote error:', error.message);
    res.status(500).json({ error: error.message, endpoint: 'quote' });
  }
});

app.post('/jupiter/swap', async (req, res) => {
  try {
    const url = `${JUPITER_API}/swap`;
    console.log('Fetching swap transaction');
    
    const response = await httpsFetch(url, {
      method: 'POST',
      body: JSON.stringify(req.body)
    });
    const data = await response.text();
    
    console.log('Swap response status:', response.status);
    res.set('Content-Type', 'application/json');
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Swap error:', error.message);
    res.status(500).json({ error: error.message, endpoint: 'swap' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Jupiter Proxy v2 running on port ${PORT}`));
