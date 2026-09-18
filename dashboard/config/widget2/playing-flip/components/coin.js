/**
 * coin.js — a flippable purple coin.
 *
 * One face is engraved with a large H, the other with a large T. Calling
 * `flip()` tosses the coin: it hops, spins several full turns on its X axis,
 * and settles on a uniformly random face. `onLand` fires once the coin has
 * come to rest with the landed side. `celebrate()` gives the coin a quick
 * swell — the coin doesn't know what's worth celebrating, so the controller
 * decides when to call it.
 *
 * A side is reported as a number so that callers can total it directly: HEADS
 * is 1 and TAILS is 0.
 *
 * The coin is decorative — its container is aria-hidden and the result is
 * announced by the widget's live-region output. Nothing here touches that
 * output; the controller wires the two together.
 *
 * Rotation accumulates rather than resetting, so the coin always spins forward
 * and never rewinds between flips. Heads sits at every multiple of 360deg,
 * tails at every odd multiple of 180deg.
 */

export const HEADS = 1;
export const TAILS = 0;

const FULL_TURN = 360;
const MIN_TURNS = 3;
const MAX_EXTRA_TURNS = 2;
const FLIP_MS = 1200;

export function createCoin(container, { onLand } = {}) {
  // Honors the OS setting: with reduced motion the coin lands immediately.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let rotation = 0; // degrees, only ever increasing
  let flipping = false;
  let landTimer = null;

  container.innerHTML = `
    <div class="coin-stage">
      <div class="coin-toss">
        <div class="coin">
          <div class="coin__face coin__face--heads"><span class="coin__value">H</span></div>
          <div class="coin__edge"></div>
          <div class="coin__face coin__face--tails"><span class="coin__value">T</span></div>
        </div>
      </div>
    </div>
  `;

  const stage = container.querySelector(".coin-stage");
  const toss = container.querySelector(".coin-toss");
  const coin = container.querySelector(".coin");

  // Single source of truth for the flip duration: JS sets it, CSS reads it.
  container.style.setProperty("--coin-flip-duration", `${FLIP_MS}ms`);

  function duration() {
    return reduceMotion.matches ? 0 : FLIP_MS;
  }

  function render() {
    coin.style.transform = `rotateX(${rotation}deg)`;
  }

  // Add whole turns, then whatever half-turn is needed to show `side`.
  function rotationFor(side) {
    const turns = MIN_TURNS + Math.floor(Math.random() * (MAX_EXTRA_TURNS + 1));
    let next = rotation + turns * FULL_TURN;
    const target = side === HEADS ? 0 : 180;
    const current = ((next % FULL_TURN) + FULL_TURN) % FULL_TURN;
    return next + ((target - current + FULL_TURN) % FULL_TURN);
  }

  function flip() {
    if (flipping) return null;
    flipping = true;

    const side = Math.random() < 0.5 ? HEADS : TAILS;
    rotation = rotationFor(side);
    render();

    // Restarting the hop needs the animation removed and reflowed first,
    // otherwise a second flip reuses the still-registered animation.
    stage.classList.remove("is-flipping");
    void stage.offsetWidth;
    stage.classList.add("is-flipping");

    landTimer = window.setTimeout(() => {
      flipping = false;
      stage.classList.remove("is-flipping");
      if (onLand) onLand(side);
    }, duration());

    return side;
  }

  // A brief swell, emphasizing a flip that scored. Lives on .coin-stage so it
  // can't collide with the hop (.coin-toss) or the spin (.coin).
  function celebrate() {
    if (reduceMotion.matches) return;
    stage.classList.remove("is-celebrating");
    void stage.offsetWidth;
    stage.classList.add("is-celebrating");
  }

  toss.addEventListener("animationend", () => {
    stage.classList.remove("is-flipping");
  });

  stage.addEventListener("animationend", (event) => {
    if (event.target === stage) stage.classList.remove("is-celebrating");
  });

  render();

  return {
    element: container,
    flip,
    celebrate,
    isFlipping: () => flipping,
    // False under reduced motion, where a flip resolves immediately and there
    // is no animation to wait on.
    isAnimated: () => !reduceMotion.matches,
    destroy() {
      window.clearTimeout(landTimer);
      container.innerHTML = "";
    },
  };
}
