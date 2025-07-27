const mongoose = require('mongoose');

module.exports = mongoose.model('GameRound', new mongoose.Schema({
  round_id: Number,
  crash_point: Number,
  bets: Array,
  cashouts: Array
}));