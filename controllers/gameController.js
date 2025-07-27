const Player = require("../models/Player");
const { getCryptoPrice } = require("../utils/priceFetcher");
const { createTransaction } = require("../utils/mockTx");
const { getWallet } = require("./WalletController");

let currentRound = { bets: [], currentMultiplier: 1, price: 0 };

function resetCurrentRound() {
  currentRound.bets = [];
  currentRound.currentMultiplier = 1.0;
}
const placeBet = async (player_id, usd_amount, currency, socket) => {
  try {
    
    const price = await getCryptoPrice();

    
    const cryptoAmount = usd_amount * price;
    const player = await Player.findById(player_id);
  

    if (!player || player.wallet.get(currency) < cryptoAmount) {
      return socket.emit("bet_result", {
        success: false,
        message: "Insufficient funds",
      });
    }
    player.wallet.set(currency, player.wallet.get(currency) - cryptoAmount);
    await player.save();
    currentRound.bets.push({ player_id, usd_amount, cryptoAmount, currency });
    currentRound.price = price;
    await createTransaction(
      "bet",
      player_id,
      usd_amount,
      cryptoAmount,
      currency,
      price
    );
   
    await getWallet(player_id, socket);
    socket.emit("bet_result", {
      success: true,
      message: "Bet placed successfully",
    });
  } catch (err) {
    socket.emit("bet_result", { success: false, message: "Bet failed" });
  }
};

const cashOut = async (player_id, socket) => {
  try {
 

    const bet = currentRound.bets.find((b) => b.player_id === player_id);

    if (!bet)
      return socket.emit("cashout_result", {
        success: false,
        message: "No active bet",
      });
    const multiplier = currentRound.currentMultiplier;
    const payout = bet.cryptoAmount * multiplier;
    const player = await Player.findById(player_id);
    player.wallet.set(
      bet.currency,
      (player.wallet.get(bet.currency) || 0) + payout
    );
    await player.save();
    await createTransaction(
      "cashout",
      player_id,
      bet.usd_amount * multiplier,
      payout,
      bet.currency,
      currentRound.price
    );
    socket.emit("cashout_result", { success: true, payout });
    await getWallet(player_id, socket);
  } catch (err) {
    socket.emit("cashout_result", { success: false, error: "Cashout failed" });
  }
};

module.exports = { placeBet, cashOut, currentRound, resetCurrentRound };
