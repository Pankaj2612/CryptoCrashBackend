const mongoose = require('mongoose');

module.exports = mongoose.model('Player', new mongoose.Schema({
  wallet: { type: Map, of: Number, default: { BTC: 0, ETH: 0 } }
}));