// ScreenAnalyticsOverlay
//
// Floating diagnostic overlay enabled by `show-screen-analytics=true` in the
// URL query string.  Reports the share of real visitors (from a Statsig sample
// of inner-window dimensions) whose viewport is no larger than the current
// window in *both* axes.  Useful for sizing decisions when laying out new lab
// UI: drag the window down to a target size and read off the fraction of
// users that fit.
//
// The sample is a fixed snapshot aggregated across the full collection
// window; counts are summed across days because what matters is the
// distribution of viewport sizes, not when they were observed.

import React, {useEffect, useState} from 'react';

import moduleStyles from './ScreenAnalyticsOverlay.module.scss';

// [innerWidth, innerHeight, userCount] from Statsig 68, 2026-02-23..2026-03-15.
const SAMPLE: ReadonlyArray<readonly [number, number, number]> = [
  [1366, 599, 2270],
  [1920, 911, 1390],
  [1366, 647, 1120],
  [1366, 633, 1044],
  [1366, 768, 595],
  [1920, 945, 556],
  [1517, 684, 415],
  [1358, 636, 370],
  [1366, 681, 310],
  [1318, 647, 289],
  [1517, 731, 282],
  [1280, 551, 269],
  [1440, 731, 243],
  [1920, 919, 224],
  [1912, 948, 200],
  [1517, 852, 180],
  [1300, 561, 178],
  [1517, 717, 170],
  [1920, 893, 155],
  [1920, 953, 152],
  [1280, 631, 152],
  [1920, 958, 144],
  [1440, 778, 135],
  [1920, 859, 128],
  [1180, 692, 118],
  [1300, 609, 111],
  [2240, 1172, 95],
  [1318, 636, 95],
  [1920, 867, 93],
  [1517, 765, 91],
  [1318, 681, 91],
  [1469, 731, 89],
  [1358, 602, 82],
  [1912, 914, 76],
  [1263, 620, 74],
  [2240, 1138, 71],
  [1600, 731, 71],
  [1241, 529, 71],
  [1300, 731, 70],
  [1536, 695, 64],
  [1680, 871, 63],
  [1300, 596, 63],
  [1440, 812, 56],
  [1272, 588, 55],
  [1920, 959, 51],
  [2560, 1271, 48],
  [1707, 748, 48],
  [1528, 698, 48],
  [1300, 643, 47],
  [1680, 923, 45],
];

const TOTAL_USERS = SAMPLE.reduce((s, [, , n]) => s + n, 0);

function fitCount(width: number, height: number): number {
  let n = 0;
  for (const [w, h, count] of SAMPLE) {
    if (w <= width && h <= height) n += count;
  }
  return n;
}

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    new URLSearchParams(window.location.search).get('show-screen-analytics') ===
    'true'
  );
}

const ScreenAnalyticsOverlay: React.FC = () => {
  const [enabled] = useState(isEnabled);
  const [size, setSize] = useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    if (!enabled) return;
    const onResize = () =>
      setSize({w: window.innerWidth, h: window.innerHeight});
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [enabled]);

  if (!enabled) return null;

  const fits = fitCount(size.w, size.h);
  const pct = (100 * fits) / TOTAL_USERS;

  return (
    <div className={moduleStyles.overlay} aria-hidden="true">
      <div className={moduleStyles.percent}>{pct.toFixed(1)}% fit</div>
      <div>
        {size.w} &times; {size.h}
      </div>
      <div>
        {fits.toLocaleString()} / {TOTAL_USERS.toLocaleString()} users
      </div>
    </div>
  );
};

export default ScreenAnalyticsOverlay;
