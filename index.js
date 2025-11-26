const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const JUPITER_API = 'https://quote-api.jup.ag/v6';

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/jupiter/quote', async (req, res) => {
  const params = new URLSearchParams(req.query).toString();
  const response = await fetch(`${JUPITER_API}/quote?${params}`);
  res.json(await response.json());
});

app.post('/jupiter/swap', async (req, res) => {
  const response = await fetch(`${JUPITER_API}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });
  res.json(await response.json());
});

app.listen(process.env.PORT || 3000);
