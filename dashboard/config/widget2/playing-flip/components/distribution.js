/**
 * distribution.js — how the flips have landed so far.
 *
 * Owns the whole distribution section: the bar chart it builds inside
 * `.distribution-chart`, and the two frequency readouts already in the markup.
 * Counting lives here so the chart and the numbers can never disagree — the
 * controller just reports each landed value with `record(value)`.
 *
 * The chart is plotted on a fixed 0–`scaleMax` axis with a labeled tick every
 * `tickStep`, so a bar's height reads as an absolute count rather than as a
 * share of the other bar. A couple of flips in, the plot is nearly empty.
 *
 * The chart is aria-hidden. The frequency readouts carry the same information
 * as plain text, readable on demand rather than announced.
 */

import { HEADS } from "./coin.js";

const CATEGORIES = [
  { key: "heads", glyph: "H" },
  { key: "tails", glyph: "T" },
];

export function createDistribution(
  container,
  { scaleMax = 30, tickStep = 10 } = {},
) {
  // Guard the divisor: a zero or negative scale would render NaN heights.
  const max = Math.max(1, scaleMax);
  const step = Math.max(1, tickStep);
  const counts = { heads: 0, tails: 0 };

  const ticks = [];
  for (let value = 0; value <= max; value += step) ticks.push(value);

  const percentOf = (value) => (value / max) * 100;

  const chart = container.querySelector(".distribution-chart");
  const frequencies = {
    heads: container.querySelector("#heads-frequency"),
    tails: container.querySelector("#tails-frequency"),
  };

  chart.innerHTML = `
    <div class="distribution-plot">
      <div class="distribution-scale">
        ${ticks
          .map(
            (tick) => `
          <span class="distribution-scale__tick" style="bottom: ${percentOf(tick)}%"
            >${tick}</span
          >`,
          )
          .join("")}
      </div>
      <div class="distribution-track">
        ${ticks
          .filter((tick) => tick > 0)
          .map(
            (tick) => `
          <div class="distribution-track__gridline" style="bottom: ${percentOf(tick)}%"></div>`,
          )
          .join("")}
        ${CATEGORIES.map(
          ({ key }) => `
          <div class="distribution-bar" data-category="${key}">
            <div class="distribution-bar__fill"></div>
          </div>`,
        ).join("")}
      </div>
      <div class="distribution-legend">
        ${CATEGORIES.map(
          ({ key, glyph }) => `
          <span class="distribution-legend__item" data-category="${key}"
            >${glyph}</span
          >`,
        ).join("")}
      </div>
    </div>
  `;

  const fills = {};
  for (const { key } of CATEGORIES) {
    fills[key] = chart.querySelector(
      `[data-category="${key}"] .distribution-bar__fill`,
    );
  }

  function render() {
    for (const { key } of CATEGORIES) {
      // Clamped so a count past the top of the scale can't overflow the plot.
      fills[key].style.height = `${Math.min(100, percentOf(counts[key]))}%`;
      frequencies[key].textContent = String(counts[key]);
    }
  }

  render();

  return {
    element: container,

    record(side) {
      counts[side === HEADS ? "heads" : "tails"] += 1;
      render();
    },

    getCounts: () => ({ ...counts }),

    reset() {
      counts.heads = 0;
      counts.tails = 0;
      render();
    },
  };
}
