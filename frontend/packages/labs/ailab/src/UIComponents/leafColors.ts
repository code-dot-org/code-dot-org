import type {CSSProperties} from 'react';

// Leaves cycle through this order, chosen so neighbors have good contrast for
// colorblindness, including across the wrap from last to first.
const LEAF_COLORS = [
  'brand',
  'accent-orange',
  'info',
  'error',
  'warning',
  'accent-pink',
  'success',
];

export function leafColorStyle(answerIndex: number): CSSProperties {
  const color = LEAF_COLORS[answerIndex % LEAF_COLORS.length];
  return {
    '--leaf-color': `var(--background-${color}-primary)`,
    '--leaf-color-light': `var(--background-${color}-light)`,
  } as CSSProperties;
}
