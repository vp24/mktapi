const express = require('express');
const cors = require('cors');

const { getMarketScreenerLink } = require('./services/googleService');
const { scrapeMarketScreenerData } = require('./services/marketscreenerService');

const app = express();
const port = 3000;

app.use(cors());

app.get('/search', async (req, res) => {
  const ticker = req.query.ticker;

  if (!ticker) {
    return res.status(400).send('Please provide a stock ticker (e.g., /search?ticker=MSFT)');
  }

  try {
    const marketScreenerLink = await getMarketScreenerLink(ticker);
    const scrapedData = await scrapeMarketScreenerData(marketScreenerLink);

    if (scrapedData) {
      res.json({ ...scrapedData, link: marketScreenerLink });
    } else {
      res.status(404).send('Scraped data not found');
    }
  } catch (error) {
    if (error.message === 'MarketScreener Link Not Found') {
      res.status(404).send('MarketScreener link not found');
    } else {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});