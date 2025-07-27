const { getCrashPoint } = require("../utils/fairCrash");
const {
  placeBet,
  cashOut,
  currentRound,
  resetCurrentRound,
} = require("../controllers/gameController");
const { getWallet } = require("../controllers/WalletController");
const crypto = require("crypto");
const GameRound = require("../models/GameRound");

let roundNumber = 1;
let pendingBets = [];
let isRoundActive = false;
let gameLoopStarted = false; // prevent multiple game loops

exports.initSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("place_bet", async ({ player_id, usd_amount, currency }) => {
      if (isRoundActive) {
        socket.emit(
          "error_detected",
          "A round is currently active. Please wait for it to finish."
        );
        return;
      }
      if (usd_amount <= 0) {
        socket.emit("error_detected", "Bet amount must be greater than zero.");
        return;
      }
      pendingBets.push({
        player_id,
        usd_amount,
        currency,
        socket,
      });
    });

    socket.on("cashout", async ({ player_id }) => {
      await cashOut(player_id, socket);
    });

    socket.on("balance_request", async ({ player_id }) => {
      await getWallet(player_id, socket);
    });
  });

  if (!gameLoopStarted) {
    gameLoopStarted = true;
    startGameLoop(io);
  }
};

const startGameLoop = (io) => {
  const run = async () => {
    if (!isRoundActive) {
      await startRound(io);
    }
    // delay before next round starts
  };
  run();
};

const startRound = async (io) => {
  isRoundActive = true;
  const seed = crypto.randomBytes(16).toString("hex");
  const crash = getCrashPoint(seed, roundNumber);
  const growthFactor = 0.02; // Adjust as needed
  const roundStartTime = Date.now(); // Track round start time
  let multiplier = 1.0;

  resetCurrentRound();

  for (const bet of pendingBets) {
    const { player_id, usd_amount, currency, socket } = bet;
    await placeBet(player_id, usd_amount, currency, socket);
  }

  pendingBets = [];

  io.emit("round_start", {
    id: roundNumber,
    multiplier: 1.0,
    isActive: true,
    status: "active",
    players: currentRound.bets,
  });

  const interval = setInterval(() => {
    const timeElapsed = (Date.now() - roundStartTime) / 1000;
    multiplier += growthFactor * timeElapsed;
    currentRound.currentMultiplier = multiplier;

    if (multiplier >= crash) {
      io.emit("round_crash", {
        crash_point: crash,
        status: "crashed",
        id: roundNumber,
      });
      clearInterval(interval);
      roundNumber++;
      isRoundActive = false;

      let countdown = 10;
      io.emit("countdown_tick", { nextRoundIn: countdown }); // Emit instantly

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
          io.emit("countdown_tick", { nextRoundIn: countdown });
        } else {
          clearInterval(countdownInterval);
          startRound(io); // Start next round after countdown
        }
      }, 1000);
    } else {
      io.emit("multiplier_update", {
        multiplier: parseFloat(multiplier.toFixed(2)),
      });
    }
  }, 100);
  // Only Save round data to DB if bet is placed 
  if (currentRound.bets.length > 0) {
    try {
      await GameRound.create({
        round_id: roundNumber,
        crash_point: crash,
        bets: currentRound.bets,
        cashouts: currentRound.cashouts, // you need to collect this in your gameController
      });
      console.log(`Round ${roundNumber} saved to DB`);
    } catch (err) {
      console.error("Failed to save round to DB:", err);
    }
  }
};
