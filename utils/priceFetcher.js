const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
let cache = {};

exports.getCryptoPrice = async () => {
  if (cache["USD"] && Date.now() - cache["USD"].timestamp < 60000) {
    return cache["USD"].price;
  }

  const headers = {
    "X-CMC_PRO_API_KEY": process.env.EXCHANGE_API_KEY,
    Accept: "application/json",
  };
  const params = {
    symbol: "USD",
    amount: 1,
    convert_id: "1",
  };
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v2/tools/price-conversion",
      { params, headers }
    );
    if (response) {
      price = response.data.data[0].quote["1"].price;
      cache["USD"] = { price: price, timestamp: Date.now() };
      return price;
    }
  } catch (error) {
    console.error(
      "Error fetching price conversion:",
      error.response?.data || error.message
    );
  }
};
