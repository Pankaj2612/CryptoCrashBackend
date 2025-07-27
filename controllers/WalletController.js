const Player = require("../models/Player");
const { getCryptoPrice } = require("../utils/priceFetcher");

exports.getWallet = async (playerId, socket) => {
  try {
    const player = await Player.findById(playerId);
    if (!player) {
      return socket.emit("balance_update", "Player not found");
    }
    socket.emit("balance_update", {
      success: true,
      wallet: player.wallet.get("BTC"),
    });
  } catch (error) {
    socket.emit("error_detected", "An error occurred fetching balance");
  }
};
