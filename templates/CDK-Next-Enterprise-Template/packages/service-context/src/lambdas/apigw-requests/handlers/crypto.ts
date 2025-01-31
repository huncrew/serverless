import axios from 'axios';

interface Coin {
  id: number;
  name: string;
  symbol: string;
  slug: string;
  market_cap: number
}

interface HistoricalQuote {
  price: number;
  volume_24h: number;
  timestamp: string;
}

// ... [Other imports and code remain the same]

export const cryptoHandler = async (event: any = {}): Promise<any> => {
    try {
      const coinMarketCapApiKey = process.env.COINMARKETCAP_API_KEY;
      if (!coinMarketCapApiKey) {
        throw new Error('CoinMarketCap API key not set in environment variables');
      }
  
      // Categories to process
      const categoryNames = ['Gaming', 'AI & Big Data'];
  
      // Get category IDs
      const categoryIdMap = await getCategoryIds(categoryNames, coinMarketCapApiKey);
  
      let allCoins: Coin[] = [];
      const coinIdMap: { [key: string]: Coin } = {};
  
      // Fetch top 50 coins from each category concurrently
      const categoryPromises = categoryNames.map(async (categoryName) => {
        const categoryId = categoryIdMap[categoryName];
        if (!categoryId) {
          console.warn(`Category ID not found for ${categoryName}`);
          return;
        }
        const coins = await getTopCoinsByCategory(categoryId, 50, coinMarketCapApiKey);
        for (const coin of coins) {
          allCoins.push(coin);
          coinIdMap[coin.id] = coin;
        }
      });
  
      await Promise.all(categoryPromises);
  
      // Get unique coin IDs
      const coinIds = [...new Set(allCoins.map((coin) => coin.id))];
  
      // Fetch historical data for these coins
      const historicalData = await getHistoricalDataForCoins(coinIds, coinMarketCapApiKey);
  
      // Process the data to find coins matching each strategy
      const strategyResults = processCoins(historicalData, coinIdMap);

      console.log('in processssssing coins ids', strategyResults);
  
      // Return the matching coins grouped by strategy
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(strategyResults),
      };
    } catch (error: any) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
  
  // ... [Other functions remain the same]
  

// Function to get category IDs
async function getCategoryIds(
  categoryNames: string[],
  apiKey: string
): Promise<{ [key: string]: string }> {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/categories`;
  const headers = {
    'X-CMC_PRO_API_KEY': apiKey,
  };

  const response = await axios.get(url, { headers });
  const categories = response.data.data;

  const categoryIdMap: { [key: string]: string } = {};

  for (const category of categories) {
    if (categoryNames.includes(category.name)) {
      categoryIdMap[category.name] = category.id;
    }
  }

  return categoryIdMap;
}

// Function to get top N coins by category
async function getTopCoinsByCategory(
  categoryId: string,
  limit: number,
  apiKey: string
): Promise<Coin[]> {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/category`;
  const params = {
    id: categoryId,
    limit: limit,
  };
  const headers = {
    'X-CMC_PRO_API_KEY': apiKey,
  };

  const response = await axios.get(url, { params, headers });
  const coins = response.data.data.coins;

  return coins;
}

// Function to get historical data for coins
async function getHistoricalDataForCoins(
  coinIds: number[],
  apiKey: string
): Promise<any> {
  const url = `https://pro-api.coinmarketcap.com/v3/cryptocurrency/quotes/historical`;

  // Set the time range (e.g., last 7 days)
  const now = new Date();
  const timeEnd = now.toISOString();
  const timeStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(); // Last 10 days

  // Batch the coin IDs
  const batchSize = 50; // Adjust based on API limits
  const batches = [];
  for (let i = 0; i < coinIds.length; i += batchSize) {
    batches.push(coinIds.slice(i, i + batchSize));
  }

  const historicalData: any = {};

  for (const batch of batches) {
    const params = {
      id: batch.join(','),
      time_start: timeStart,
      time_end: timeEnd,
      interval: 'daily',
    };
    const headers = {
      'X-CMC_PRO_API_KEY': apiKey,
    };

    const response = await axios.get(url, { params, headers });
    const data = response.data.data;

    Object.assign(historicalData, data);
  }

  return historicalData;
}

// Function to process coins and find those matching each strategy
function processCoins(
  historicalData: any,
  coinIdMap: { [key: string]: Coin }
): any {
  const buyingDipsCoins: any[] = [];
  const flatlinersCoins: any[] = [];

  for (const coinId in historicalData) {
    const coinData = historicalData[coinId];
    const quotes = coinData.quotes;
    const coinInfo = coinIdMap[parseInt(coinId)];

    if (!coinInfo || quotes.length < 2) continue;

    // Convert market cap to a number
    const marketCap = Number(coinInfo.market_cap);
    if (!marketCap || marketCap > 2000000000) continue; // Skip coins with market cap > $2 billion

    // Calculate price and volume changes
    const priceStart = quotes[0].quote.USD.price;
    const priceEnd = quotes[quotes.length - 1].quote.USD.price;
    const priceChangePercent = ((priceEnd - priceStart) / priceStart) * 100;

    const volumeStart = quotes[0].quote.USD.volume_24h;
    const volumeEnd = quotes[quotes.length - 1].quote.USD.volume_24h;

    // Strategy 1: Buying Dips (Volatile Coins Near Recent Lows)
    const pricesLast7Days = quotes.slice(-7).map((quote: any) => quote.quote.USD.price);

    const priceHigh = Math.max(...pricesLast7Days);
    const priceLow = Math.min(...pricesLast7Days);
    const currentPrice = pricesLast7Days[pricesLast7Days.length - 1];

    const priceSwing = ((priceHigh - priceLow) / priceLow) * 100;
    const pricePosition = ((currentPrice - priceLow) / (priceHigh - priceLow)) * 100;

    if (priceSwing >= 20 && pricePosition <= 30) {
      const volatilityScore = Math.min(priceSwing / 50, 1);
      const pricePositionScore = 1 - (pricePosition / 30);

      const totalScore = (volatilityScore * 0.6) + (pricePositionScore * 0.4);

      buyingDipsCoins.push({
        id: coinId,
        name: coinInfo.name,
        symbol: coinInfo.symbol,
        totalScore: totalScore.toFixed(4),
        volatilityScore: volatilityScore.toFixed(4),
        pricePositionScore: pricePositionScore.toFixed(4),
        priceSwing: priceSwing.toFixed(2),
        pricePosition: pricePosition.toFixed(2),
        currentPrice: currentPrice.toFixed(4),
        stopLossPrice: (currentPrice * 0.95).toFixed(4),
        targetSellPrice: (currentPrice * 1.10).toFixed(4),
        coinLink: `https://coinmarketcap.com/currencies/${coinInfo.slug}`,
      });
    }

    // Strategy 2: Flatliners
    const priceChanges = [];
    for (let i = 1; i < quotes.length; i++) {
      const prevQuote = quotes[i - 1];
      const currQuote = quotes[i];
      const priceChange = ((currQuote.quote.USD.price - prevQuote.quote.USD.price) / prevQuote.quote.USD.price) * 100;
      priceChanges.push(priceChange);
    }

    const maxPriceChange = Math.max(...priceChanges.map(Math.abs));

    if (maxPriceChange > 10) continue; // Ensure price is stable within 10%

    const volumeSpikes = quotes.slice(-3).some((quote, i, arr) => {
      if (i === 0) return false;
      const prevVolume = arr[i - 1].quote.USD.volume_24h;
      return quote.quote.USD.volume_24h > prevVolume * 1.5; // 50% volume spike
    });

    if (volumeSpikes) {
      const volumeStartIndex = quotes.length - 8 >= 0 ? quotes.length - 8 : 0;
      const volumeStart7d = quotes[volumeStartIndex].quote.USD.volume_24h;
      const volumeChange7dPercent = ((volumeEnd - volumeStart7d) / volumeStart7d) * 100;

      if (volumeChange7dPercent > 5) {
        const priceStabilityScore = 1 - (maxPriceChange / 10);
        const volumeIncreaseScore = Math.min(volumeChange7dPercent / 100, 1);

        const totalScore = (priceStabilityScore * 0.6) + (volumeIncreaseScore * 0.4);

        flatlinersCoins.push({
          id: coinId,
          name: coinInfo.name,
          symbol: coinInfo.symbol,
          totalScore: totalScore.toFixed(4),
          priceStabilityScore: priceStabilityScore.toFixed(4),
          volumeIncreaseScore: volumeIncreaseScore.toFixed(4),
          maxPriceChange: maxPriceChange.toFixed(2),
          volumeChange7d: volumeChange7dPercent.toFixed(2),
          currentPrice: priceEnd.toFixed(4),
          stopLossPrice: (priceEnd * 0.97).toFixed(4),
          targetSellPrice: (priceEnd * 1.15).toFixed(4),
          coinLink: `https://coinmarketcap.com/currencies/${coinInfo.slug}`,
        });
      }
    }
  }

  // Sort the lists by totalScore in descending order
  buyingDipsCoins.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));
  flatlinersCoins.sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore));

  return {
    buyingDips: buyingDipsCoins,
    flatliners: flatlinersCoins,
  };
}

