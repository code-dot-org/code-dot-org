// The colors a learner is offered, and how much of the picker a level opens.
//
// The picker itself is a dropdown full of DOM and cannot be seen from here —
// jsdom lays out no SVG and Blockly draws none. What CAN be pinned is the set
// of colors and the switch that decides whether the spectrum is offered at all,
// which is the whole of the difference between the two interfaces.

import {describe, expect, it} from 'vitest';

import {COLOR_SWATCHES, SWATCHES_PER_ROW, swatchName} from '../../colorPalette';
import {usesSimpleColors, type WorldLevelProperties} from '../../levelData';
import {offersSpectrum, setSimpleColors} from '../fields/FieldColorPicker';

describe('the offered colors', () => {
  it('are sixteen, each a six-digit hex, none of them twice', () => {
    expect(COLOR_SWATCHES).toHaveLength(16);
    for (const {hex, name} of COLOR_SWATCHES) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(name.trim()).not.toBe('');
    }
    expect(new Set(COLOR_SWATCHES.map(s => s.hex)).size).toBe(16);
    expect(new Set(COLOR_SWATCHES.map(s => s.name)).size).toBe(16);
  });

  it('fill whole rows, so the grid has no gap in it', () => {
    expect(COLOR_SWATCHES.length % SWATCHES_PER_ROW).toBe(0);
  });

  it('include the colors the lab itself already uses', () => {
    // So a project can be matched to the rules it took, from the swatches
    // alone: a switch and a wall are `#e0484a`, a teleport pad is `#4da3ff`,
    // and a new world's backdrop is `#101020`.
    expect(swatchName('#e0484a')).toBe('red');
    expect(swatchName('#4da3ff')).toBe('blue');
    expect(swatchName('#101020')).toBe('midnight');
    expect(swatchName('#123456')).toBeUndefined();
  });
});

describe('how much of the picker a level opens', () => {
  it('offers the spectrum unless a level asks for the simple one', () => {
    expect(usesSimpleColors(undefined)).toBe(false);
    expect(
      usesSimpleColors({
        levelData: {simpleColors: true},
      } as WorldLevelProperties),
    ).toBe(true);
    expect(
      usesSimpleColors({
        levelData: {simpleColors: false},
      } as WorldLevelProperties),
    ).toBe(false);
  });

  it('reaches the field, which has no other way to hear it', () => {
    // A Blockly field cannot read React state; the editor installs this from
    // the level's data on mount, the same shape `setModuleOpener` has.
    try {
      expect(offersSpectrum()).toBe(true);
      setSimpleColors(true);
      expect(offersSpectrum()).toBe(false);
    } finally {
      setSimpleColors(false);
    }
  });
});
