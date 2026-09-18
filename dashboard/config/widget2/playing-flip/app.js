/**
 * app.js — the Flip controller.
 *
 * Wires the flip button to the coin, and the coin's landing to the points
 * readout. The coin owns its own animation and markup; this file only knows
 * that a flip eventually comes up heads or tails.
 *
 * The running total belongs to no single component, so it lives here: heads
 * earns a point, tails earns nothing. Earning a point also sets off two
 * parallel celebrations — a confetti burst and a swell of the coin itself.
 * Every landing is reported to the distribution, which keeps its own tally of
 * how the flips have split.
 *
 * Flips are a finite budget. The starting count comes from the markup, so the
 * number in index.html stays the single source of truth; each flip spends one,
 * and the button is disabled once the budget runs out.
 *
 * The button is also disabled mid-toss, so a flip can't be interrupted — but
 * only when there's an animation to wait on. Under reduced motion the coin
 * lands immediately, and a disable/enable flicker would cost a keyboard user
 * their focus for nothing.
 */

import { createCoin, HEADS } from "./components/coin.js";
import { createConfetti } from "./components/confetti.js";
import { createDistribution } from "./components/distribution.js";

const flipButton = document.getElementById("flip-button");
const flipResult = document.getElementById("flip-result");
const flipsRemainingResult = document.getElementById("flip-remaining");
const coinContainer = document.querySelector(".coin-container");

const totalFlips = Number.parseInt(flipsRemainingResult.textContent, 10) || 0;

const confetti = createConfetti();
// The chart's axis tops out at the whole flip budget, so an unbroken run of
// heads would exactly fill the plot.
const distribution = createDistribution(
  document.querySelector(".distribution-container"),
  { scaleMax: totalFlips, tickStep: 10 },
);

let points = 0;
let flipsRemaining = totalFlips;
let refocusButton = false;

const coin = createCoin(coinContainer, {
  onLand(side) {
    // HEADS is 1 and TAILS is 0, so the landed side is also its point value.
    points += side;
    flipResult.textContent = String(points);
    distribution.record(side);
    if (side === HEADS) {
      coin.celebrate();
      confetti.burstFrom(coinContainer);
    }
    renderControls();
    // Disabling a focused button drops focus to <body>. Hand it back once the
    // button is live again, so a keyboard user keeps their place.
    if (refocusButton && !flipButton.disabled) flipButton.focus();
    refocusButton = false;
  },
});

function renderControls() {
  flipsRemainingResult.textContent = String(flipsRemaining);
  const midToss = coin.isAnimated() && coin.isFlipping();
  flipButton.disabled = flipsRemaining === 0 || midToss;
}

flipButton.addEventListener("click", () => {
  if (flipsRemaining === 0) return;
  // A click during an in-flight flip is ignored by the coin — don't charge for
  // a toss that never happened.
  if (coin.flip() === null) return;
  flipsRemaining -= 1;
  refocusButton = document.activeElement === flipButton;
  renderControls();
});

renderControls();
