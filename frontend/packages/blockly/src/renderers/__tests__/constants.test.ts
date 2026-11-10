import * as Blockly from 'blockly/core';
import {describe, expect, it} from 'vitest';

import {PluginType} from '../../plugins';
import type {InputPlugin} from '../../plugins';
import {isDarkTheme} from '../../themes/isDarkTheme';
import CdoConstantsProvider from '../constants';

type PuzzleTab = Blockly.blockRendering.PuzzleTab;

// The path text records which plugin drew it, and the type the shape number.
const input = (check: string, shape: string): InputPlugin => ({
  type: PluginType.Input,
  check,
  shape,
  makePath: (index: number) =>
    ({
      type: index,
      width: 0,
      height: 0,
      pathDown: check,
      pathUp: check,
    }) as PuzzleTab,
});

const connection = (type: number, check: string[] | null) =>
  ({type, getCheck: () => check}) as unknown as Blockly.RenderedConnection;

describe('definitions.md: renderer constants', () => {
  it("DEF-36: numbers new shapes above Blockly's and reuses a shape's number", () => {
    const provider = new CdoConstantsProvider([
      input('A', 'square'),
      input('B', 'round'),
      input('C', 'square'),
    ]);
    expect(provider.SHAPES).toEqual({PUZZLE: 1, NOTCH: 2, square: 3, round: 4});
  });

  it('DEF-36: a later plugin with the same check replaces an earlier one', () => {
    const provider = new CdoConstantsProvider([
      input('A', 'square'),
      {...input('A', 'round'), makePath: () => ({type: 9}) as PuzzleTab},
    ]);
    provider.init();
    const shape = provider.shapeFor(
      connection(Blockly.ConnectionType.INPUT_VALUE, ['A']),
    ) as PuzzleTab;
    expect(shape.type).toBe(9);
  });

  it("DEF-37: a value connection takes its first check's shape, else Blockly's", () => {
    const provider = new CdoConstantsProvider([input('A', 'square')]);
    provider.init();
    const value = (check: string[] | null) =>
      provider.shapeFor(connection(Blockly.ConnectionType.INPUT_VALUE, check));

    expect((value(['A', 'C']) as PuzzleTab).pathDown).toBe('A');
    expect(value(['C', 'A'])).toBe(provider.PUZZLE_TAB);
    expect(value(null)).toBe(provider.PUZZLE_TAB);
    expect(
      provider.shapeFor(
        connection(Blockly.ConnectionType.NEXT_STATEMENT, ['A']),
      ),
    ).toBe(provider.NOTCH);
  });

  it('DEF-38: a dark theme darkens the secondary colour, from the first setTheme', () => {
    const theme = (name: string) =>
      Blockly.Theme.defineTheme(name, {
        name,
        base: Blockly.Themes.Classic,
        blockStyles: {s: {colourPrimary: '#ffffff'}},
      });
    const provider = new CdoConstantsProvider([]);
    const secondaryUnder = (name: string) => {
      provider.setTheme(theme(name));
      return provider.blockStyles.s.colourSecondary;
    };

    expect(secondaryUnder('my-dark')).toBe('#999999');
    expect(secondaryUnder('my-light')).toBe('#ffffff');
    expect(secondaryUnder('my-dark')).toBe('#999999');
  });

  it('DEF-40: a theme is dark when its name contains dark', () => {
    const named = (name: string) => ({name}) as Blockly.Theme;
    expect(isDarkTheme(named('my-dark'))).toBe(true);
    expect(isDarkTheme(named('darkness'))).toBe(true);
    expect(isDarkTheme(named('default'))).toBe(false);
    expect(isDarkTheme(undefined)).toBe(false);
  });
});
