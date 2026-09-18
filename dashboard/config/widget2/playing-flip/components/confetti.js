/**
 * confetti.js — a one-shot confetti burst.
 *
 * `burstFrom(element)` sprouts a handful of small paper scraps from the center
 * of `element`, pops them upward, then lets them tumble and waft down past the
 * bottom of the screen. Pieces clean themselves up when their fall finishes.
 *
 * The pieces live in a fixed, pointer-transparent overlay on <body> rather than
 * inside the widget, so they can travel the whole viewport without being
 * clipped by a container's bounds.
 *
 * Purely decorative: the layer is aria-hidden, and a burst is skipped outright
 * under prefers-reduced-motion.
 */

const PIECE_COUNT = 26;
const COLORS = [
  "var(--purple-300)",
  "var(--purple-400)",
  "var(--purple-500)",
  "var(--purple-600)",
  "var(--mint-400)",
  "var(--mint-500)",
];
const SHAPES = ["rect", "rect", "strip", "circle"];

// Inclusive-ish random helpers — plain floats, no rounding needed for pixels.
const between = (lo, hi) => lo + Math.random() * (hi - lo);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export function createConfetti() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  function createPiece(originX, originY) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    const shape = document.createElement("div");
    shape.className = `confetti-piece__shape confetti-piece__shape--${pick(SHAPES)}`;
    shape.style.backgroundColor = pick(COLORS);
    piece.append(shape);

    // Every piece gets its own trajectory, read by the CSS keyframes.
    piece.style.left = `${originX}px`;
    piece.style.top = `${originY}px`;
    piece.style.setProperty("--drift", `${between(-170, 170)}px`);
    piece.style.setProperty("--pop", `${between(-170, -70)}px`);
    // Far enough past the bottom edge that nothing vanishes mid-screen.
    piece.style.setProperty(
      "--fall",
      `${window.innerHeight - originY + between(60, 220)}px`,
    );
    piece.style.setProperty("--spin", `${between(-900, 900)}deg`);
    piece.style.setProperty("--fall-duration", `${between(1.7, 3)}s`);
    piece.style.setProperty("--fall-delay", `${between(0, 0.18)}s`);
    piece.style.setProperty("--flutter-duration", `${between(0.35, 0.9)}s`);
    piece.style.setProperty("--size", `${between(5, 10)}px`);

    piece.addEventListener("animationend", (event) => {
      // The inner flutter loops forever, so only the fall can end here — but
      // animationend bubbles, so make sure it's the piece's own animation.
      if (event.target === piece) piece.remove();
    });

    return piece;
  }

  return {
    element: layer,

    burstFrom(source) {
      if (reduceMotion.matches) return;

      const rect = source.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;

      const pieces = document.createDocumentFragment();
      for (let i = 0; i < PIECE_COUNT; i++) {
        pieces.append(createPiece(originX, originY));
      }
      layer.append(pieces);
    },

    destroy() {
      layer.remove();
    },
  };
}
