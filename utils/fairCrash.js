const crypto = require("crypto");

function generateRandom(seed, roundNumber) {
  const hash = crypto
    .createHash("sha256")
    .update(seed + roundNumber)
    .digest("hex");

  const int = parseInt(hash.slice(0, 13), 16); // 52 bits of randomness
  return int / Math.pow(2, 52); // normalize to [0, 1)
}

exports.getCrashPoint = (seed, roundNumber) => {
  const r = generateRandom(seed, roundNumber);

  // Bustabit-like crash formula with 1% house edge
  const houseEdge = 0.99;
  const crash = Math.floor((1 / (1 - r)) * 100) / 100;

  return Math.max(1.01, crash * houseEdge);
};
