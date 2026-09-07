// Every contrast the map depends on, hue by hue, in both themes.
//
// This is the test the first palette needed and did not have. Colors picked by
// eye at one hue and reused at thirteen others looked fine and failed by more
// than a factor of two at the far end of the wheel — white on a finished tile
// ran from 1.79:1 to 4.6:1 against a floor of 4.5, and nothing said so.
//
// The ratios are WCAG 2.2 AA: 4.5:1 for text, 3:1 for a meaningful boundary or
// icon. Failures here are not style opinions — they are a learner who cannot
// read a tile.

import {describe, expect, it} from 'vitest';

import {contrast, regionColors, rgb, SURFACES, type Theme} from '../palette';
import {REGIONS, regionHue} from '../regions';

const THEMES: Theme[] = ['light', 'dark'];

/** Every region's hue, named, so a failure says which region is wrong. */
const hues = REGIONS.map(
  region => [region.name, regionHue(region.id)] as const,
);

const ratio = (a: string, b: string) => contrast(rgb(a), rgb(b));

describe.each(THEMES)('in the %s theme', theme => {
  const surface = SURFACES[theme];

  it.each(hues)('reads the label on a finished %s tile', (name, hue) => {
    const {tone} = regionColors(hue, theme);
    expect(ratio(surface.ink, tone), name).toBeGreaterThanOrEqual(4.5);
  });

  it.each(hues)(
    'shows the %s outline against the wash behind it',
    (name, hue) => {
      const {line, field} = regionColors(hue, theme);
      expect(ratio(line, field), name).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(hues)(
    'shows the %s outline against an unfinished tile',
    (name, hue) => {
      const {line} = regionColors(hue, theme);
      expect(ratio(line, surface.surface), name).toBeGreaterThanOrEqual(3);
    },
  );

  it.each(hues)('reads the %s region name on the page', (name, hue) => {
    const colors = regionColors(hue, theme);
    expect(ratio(colors.name, surface.page), name).toBeGreaterThanOrEqual(4.5);
  });

  it('reads the label on a tile that is ready to start', () => {
    expect(ratio(surface.ink, surface.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it('reads the label on a locked tile', () => {
    expect(ratio(surface.shutInk, surface.shutFill)).toBeGreaterThanOrEqual(
      4.5,
    );
  });

  it('shows a locked tile’s outline', () => {
    // The padlock is drawn in the same ink, so this covers the icon too.
    expect(ratio(surface.shutLine, surface.shutFill)).toBeGreaterThanOrEqual(3);
    expect(ratio(surface.shutLine, surface.page)).toBeGreaterThanOrEqual(3);
  });

  it('shows the ring around the selected tile', () => {
    // The ring's job is to be visible over any tile, so the worst case is what
    // is asserted: whichever region color it contrasts with least.
    const worst = Math.min(
      ...hues.map(([, hue]) =>
        ratio(surface.ring, regionColors(hue, theme).tone),
      ),
      ratio(surface.ring, surface.surface),
      ratio(surface.ring, surface.shutFill),
    );
    expect(worst).toBeGreaterThanOrEqual(3);
  });

  it('shows the focus ring wherever it lands', () => {
    const worst = Math.min(
      ...hues.map(([, hue]) =>
        ratio(surface.focus, regionColors(hue, theme).tone),
      ),
      ratio(surface.focus, surface.surface),
      ratio(surface.focus, surface.shutFill),
    );
    expect(worst).toBeGreaterThanOrEqual(3);
  });
});
