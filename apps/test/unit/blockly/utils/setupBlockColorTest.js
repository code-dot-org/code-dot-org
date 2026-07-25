import {render, screen, act} from '@testing-library/react';
import React from 'react';

import {BLOCKLY_THEME_APPLIED_EVENT, Themes} from '@cdo/apps/blockly/constants';
import {
  getSetupBlockColorOverride,
  useRunButtonColorOverride,
} from '@cdo/apps/blockly/utils/setupBlockColor';

import setBlocklyGlobal from '../../../util/setupBlocklyGlobal';

setBlocklyGlobal();

const dispatchThemeApplied = theme =>
  document.dispatchEvent(
    new CustomEvent(BLOCKLY_THEME_APPLIED_EVENT, {detail: {theme}})
  );

describe('getSetupBlockColorOverride', () => {
  it('returns null with no theme and no workspace', () => {
    expect(Blockly.getMainWorkspace()).toBeFalsy();
    expect(getSetupBlockColorOverride()).toBeNull();
  });

  it('returns null for the modern theme and its dark variant', () => {
    expect(
      getSetupBlockColorOverride(Blockly.themes[Themes.MODERN])
    ).toBeNull();
    expect(getSetupBlockColorOverride(Blockly.themes[Themes.DARK])).toBeNull();
  });

  it('returns null for jigsaw, whose blocks hard-code colors', () => {
    expect(
      getSetupBlockColorOverride(Blockly.themes[Themes.JIGSAW])
    ).toBeNull();
  });

  // Assert literal hexes so an unintended palette change fails loudly:
  // the Run button shows these colors outside the Blockly canvas.
  it('returns the high contrast setup color', () => {
    expect(
      getSetupBlockColorOverride(Blockly.themes[Themes.HIGH_CONTRAST])
    ).toBe('#996300');
    expect(
      getSetupBlockColorOverride(Blockly.themes[Themes.HIGH_CONTRAST_DARK])
    ).toBe('#996300');
  });

  it('returns the color-vision-theme setup color', () => {
    expect(getSetupBlockColorOverride(Blockly.themes[Themes.PROTANOPIA])).toBe(
      '#FF4235'
    );
    expect(
      getSetupBlockColorOverride(Blockly.themes[Themes.DEUTERANOPIA])
    ).toBe('#FF4235');
    expect(getSetupBlockColorOverride(Blockly.themes[Themes.TRITANOPIA])).toBe(
      '#FF4235'
    );
  });
});

describe('useRunButtonColorOverride', () => {
  // Renders the hook result as visible text so assertions can query it the
  // way a user would see it.
  const Probe = () => {
    const override = useRunButtonColorOverride();
    return (
      <div>
        {override
          ? `background ${override.background} hover ${override.hover}`
          : 'no override'}
      </div>
    );
  };

  it('is null initially and tracks theme-applied events', () => {
    render(<Probe />);
    expect(screen.getByText('no override')).toBeInTheDocument();

    act(() => dispatchThemeApplied(Blockly.themes[Themes.HIGH_CONTRAST]));
    expect(screen.getByText(/background #996300/)).toBeInTheDocument();

    act(() => dispatchThemeApplied(Blockly.themes[Themes.MODERN]));
    expect(screen.getByText('no override')).toBeInTheDocument();
  });

  it('derives the hover shade from the background', () => {
    render(<Probe />);
    act(() => dispatchThemeApplied(Blockly.themes[Themes.PROTANOPIA]));
    const expectedHover = Blockly.utils.colour.blend('#000', '#FF4235', 0.2);
    expect(
      screen.getByText(`background #FF4235 hover ${expectedHover}`)
    ).toBeInTheDocument();
  });
});
