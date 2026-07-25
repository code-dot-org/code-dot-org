import * as BlocklyCore from 'blockly/core';
import {useEffect, useState} from 'react';

import {BLOCKLY_THEME_APPLIED_EVENT, Themes} from '@cdo/apps/blockly/constants';

import {getBaseName} from './workspace/themes';

export interface RunButtonColorOverride {
  background: string;
  hover: string;
}

/**
 * The setup-block color of the given theme (default: the main workspace's),
 * when it differs from the default palette.
 *
 * Null means "use the stock Primary Orange token": no Blockly global or
 * workspace on the page, the modern theme or its dark variant (their
 * setup blocks are already Primary Orange, and the stylesheet picks the
 * right hover shade per brand and theme), or jigsaw (its blocks hard-code
 * colors, so its theme's block styles say nothing about the canvas).
 */
export function getSetupBlockColorOverride(
  theme?: BlocklyCore.Theme
): string | null {
  // The global may be absent (droplet-only pages) or a partial stub.
  if (
    typeof Blockly === 'undefined' ||
    typeof Blockly.getMainWorkspace !== 'function'
  ) {
    return null;
  }
  const activeTheme = theme ?? Blockly.getMainWorkspace()?.getTheme();
  if (!activeTheme) {
    return null;
  }
  const baseName = getBaseName(activeTheme.name as Themes);
  if (baseName === Themes.MODERN || baseName === Themes.JIGSAW) {
    return null;
  }
  return activeTheme.blockStyles?.setup_blocks?.colourPrimary ?? null;
}

/**
 * Background/hover pair for a Run button mirroring the active Blockly
 * theme's setup blocks, or null to use the default Primary Orange tokens.
 * Tracks theme switches via BLOCKLY_THEME_APPLIED_EVENT.
 */
export function useRunButtonColorOverride(): RunButtonColorOverride | null {
  const [background, setBackground] = useState<string | null>(() =>
    getSetupBlockColorOverride()
  );

  useEffect(() => {
    const onThemeApplied = (event: Event) => {
      const {theme} = (event as CustomEvent<{theme: BlocklyCore.Theme}>).detail;
      setBackground(getSetupBlockColorOverride(theme));
    };
    document.addEventListener(BLOCKLY_THEME_APPLIED_EVENT, onThemeApplied);
    return () =>
      document.removeEventListener(BLOCKLY_THEME_APPLIED_EVENT, onThemeApplied);
  }, []);

  if (!background) {
    return null;
  }
  return {
    background,
    // Same darkening Blockly applies when deriving block shades; a non-null
    // override implies the Blockly global is loaded.
    hover: Blockly.utils.colour.blend('#000', background, 0.2) || background,
  };
}
