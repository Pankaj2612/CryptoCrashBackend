const mongoose = require('mongoose');

module.exports = mongoose.model('Transaction', new mongoose.Schema({
  player_id: String,
  usd_amount: Number,
  crypto_amount: Number,
  currency: String,
  transaction_type: String,
  transaction_hash: String,
  price_at_time: Number,
  timestamp: Date
}));
