const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMarketScreenerData(marketScreenerLink) {
  try {
    const marketScreenerResponse = await axios.get(marketScreenerLink);
    const $ = cheerio.load(marketScreenerResponse.data);

    const valuationSectionHTML = $('#fundamental-valorisation').html();

    if (valuationSectionHTML) {
      console.log('Scraped Data:', valuationSectionHTML); // Log the scraped HTML
      return { valuationSectionHTML }; // Return the scraped data
    } else {
      console.log('Valuation section not found');
      return null; // Return null if the section is not found
    }
  } catch (error) {
    console.error('Error scraping MarketScreener:', error);
    throw error; // Throw the error to be handled by the caller
  }
}

module.exports = { scrapeMarketScreenerData };