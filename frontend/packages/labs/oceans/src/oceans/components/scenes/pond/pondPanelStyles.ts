import * as React from 'react';

/*
 * Shared style fragments for the pond explanation panel and its bars.
 * Lives here because both panel variants (general + fish) need panelBaseSx
 * and both bar components need the BAR_* layout constants + barWidthStyle.
 */

/** sx shared by both panel variants — only `left`/`right` differs per side. */
export const panelBaseSx = {
  position: 'absolute',
  width: '30%',
  backgroundColor: 'var(--ocean-color-transparent-black)',
  color: 'var(--ocean-color-white)',
  borderRadius: '10px',
  top: '16%',
  padding: '2%',
  pointerEvents: 'none',
} as const;

/** Vertical gap between stacked bars within a panel. */
export const BAR_ITEM_MARGIN = '7%';

/** Bar fill height as a percent of its row — overflows the row deliberately. */
export const BAR_HEIGHT = '150%';

/** Vertical position of the bar's text label. */
export const BAR_LABEL_TOP = '30%';

/**
 * Inline style that drives one bar's fill width via the --ocean-bar-width CSS
 * custom property.  Width is a per-render computed value so it has to be an
 * inline CSS variable rather than a static sx entry.
 *
 * @param percent - Fill width in [0, 100].
 * @returns A React inline style object setting --ocean-bar-width.
 */
export function barWidthStyle(percent: number): React.CSSProperties {
  return {
    ['--ocean-bar-width' as keyof React.CSSProperties]: `${percent}%`,
  } as React.CSSProperties;
}
