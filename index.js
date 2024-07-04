import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

//reqquired to use, body parser
app.use(bodyParser.urlencoded({ extended: true }));

//access the styles and assets
app.use(express.static("public"));


// Route to fetch and render cryptocurrency data
app.get('/', async (req, res) => {
  try {
    const page = req.query.page || 1; // Default value is 1 page
    const perPage = req.query.per_page || 10;  // Default value is 10 perPage
    
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: page,
        sparkline: false,
        price_change_percentage: '1h,24h,7d' // Adjusted to fetch all three percentages
      }
    });

    // Map the data for easy access
    const cryptoData = response.data.map(item => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      price_usd: item.current_price,
      percent_change_1h: item.price_change_percentage_1h_in_currency,
      percent_change_24h: item.price_change_percentage_24h_in_currency,
      percent_change_7d: item.price_change_percentage_7d_in_currency,
      market_cap_usd: item.market_cap,
      market_cap_rank: item.market_cap_rank,
      image: item.image
    }));

    res.render('index.ejs', { cryptoData, currentPage: parseInt(page), perPage: parseInt(perPage) }); // Make sure currentPage and perPage are integers
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching data from CoinGecko API');
  }
});


// Route to fetch and render coin details
app.get('/coin/:id', async (req, res) => {
  const coinId = req.params.id; //get the ID
  //try catch bcs of API request
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`);//gets the details of the coin ID
    //create an object literal for easy access
    //console.log(response.data.market_data);
    
    const coinDetails = { //simplify all the date
      id: response.data.id,
      symbol: response.data.symbol,
      name: response.data.name,
      description: response.data.description.en,
      market_data: {
        current_price: response.data.market_data.current_price.usd,
        market_cap: response.data.market_data.market_cap.usd,
        market_cap_rank: response.data.market_data.market_cap_rank,
        price_change_percentage_24h: response.data.market_data.price_change_percentage_24h, 
        price_change_percentage_7d: response.data.market_data.price_change_percentage_7d, 

      },
      image: response.data.image.large 
    };
    //console.log(coinDetails.description.en);
    res.render('coins.ejs', { coinDetails });//exports the ejs with the literal object
  } catch (error) {
    console.error(error);
    console.log(error);
    res.status(500).send('Error fetching coin details');
  }
});


app.listen(port, () => {
  console.log('Server is running on  port ' + port);
});