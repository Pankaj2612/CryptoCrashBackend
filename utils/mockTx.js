const Transaction = require('../models/Transaction');
const crypto = require('crypto');

exports.createTransaction = async (type, player_id, usd, cryptoAmount, currency, price) => {
  const hash = crypto.randomBytes(16).toString('hex');
  await Transaction.create({ player_id, usd_amount: usd, crypto_amount: cryptoAmount, currency, transaction_type: type, transaction_hash: hash, price_at_time: price, timestamp: new Date() });
};