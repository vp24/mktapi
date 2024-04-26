const axios = require('axios');
const config = require('../config'); // Import your config

const MARKETSCREENER_BASE_URL = "https://www.marketscreener.com/quote/stock/";

async function getMarketScreenerLink(ticker) {
  try {
    const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: config.API_KEY, 
        cx: config.SEARCH_ENGINE_ID, 
        q: `marketscreener ${ticker} summary us`
      }
    });

    const googleSearchResultLink = searchResponse.data.items[0].link; 

    if (googleSearchResultLink.includes('marketscreener.com')) {
      const tickerPart = googleSearchResultLink.split(MARKETSCREENER_BASE_URL)[1].split('/')[0];
      const cleanLink = MARKETSCREENER_BASE_URL + tickerPart + '/finances'; 
      return cleanLink;
    } else {
      throw new Error('MarketScreener Link Not Found'); 
    }

  } catch (error) {
    console.error('Error fetching MarketScreener link:', error); 
    throw error; 
  }
}

module.exports = { getMarketScreenerLink };
