const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeMarketScreenerData(marketScreenerLink) {
  try {
    const marketScreenerResponse = await axios.get(marketScreenerLink);
    const $ = cheerio.load(marketScreenerResponse.data);

    const valuationSectionHTML = $('#fundamental-valorisation').html();
    const iseECardHTML = $('#chart_ise_e_card').html();
    const iseQCardHTML = $('#chart_ise_q_card').html();
    const bsaACardHTML = $('#chart_bsa_a_card').html();

    const scrapedData = {};

    if (valuationSectionHTML) {
      scrapedData.valuationSectionHTML = valuationSectionHTML;
    } else {
      console.log('Valuation section not found');
    }

    if (iseECardHTML) {
      scrapedData.iseECardHTML = iseECardHTML;
    } else {
      console.log('ISE E Card section not found');
    }

    if (iseQCardHTML) {
      scrapedData.iseQCardHTML = iseQCardHTML;
    } else {
      console.log('ISE Q Card section not found');
    }

    if (bsaACardHTML) {
      scrapedData.bsaACardHTML = bsaACardHTML;
    } else {
      console.log('BSA A Card section not found');
    }

    //console.log('Scraped Data:', scrapedData); // Log the scraped data
    return scrapedData; // Return the scraped data
  } catch (error) {
    console.error('Error scraping MarketScreener:', error);
    throw error; // Throw the error to be handled by the caller
  }
}

module.exports = { scrapeMarketScreenerData };