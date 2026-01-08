import * as BlocklyCore from 'blockly/core';

import {
  DARK_THEME_SUFFIX,
  Themes,
  BLOCKLY_THEME,
} from '@cdo/apps/blockly/constants';
import UserPreferences from '@cdo/apps/lib/util/UserPreferences';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {shrinkBlockSpaceContainer} from '@cdo/apps/templates/instructions/utils';

// Returns the current theme name without the 'dark' suffix, if present.
export function getBaseName(themeName: Themes) {
  if (themeName) {
    return themeName.replace(DARK_THEME_SUFFIX, '');
  }
}

export function isDarkTheme(theme: BlocklyCore.Theme | undefined) {
  return theme?.name.includes(DARK_THEME_SUFFIX);
}

/**
 * Sets the theme for the workspace and re-renders blocks if the font size changed.
 *
 * @param {BlocklyCore.Workspace} workspace - The Blockly workspace to set the theme for.
 * @param {BlocklyCore.Theme} theme - The theme to apply to the workspace.
 */
export function setThemeAndRenderBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  theme: BlocklyCore.Theme,
  previousTheme?: BlocklyCore.Theme
) {
  if (theme && workspace?.rendered) {
    // Update the main workspace's flyout if it exists.
    if (workspace.getFlyout()) {
      setThemeAndRenderBlocks(
        workspace.getFlyout()!.getWorkspace(),
        theme,
        previousTheme
      );
    }
    workspace.setTheme(theme);
    // Re-render blocks if the font size changed.
    // Once https://github.com/google/blockly/issues/7782 is resolved,
    // we should be able to remove this.
    if (theme.fontStyle?.size !== previousTheme?.fontStyle?.size) {
      workspace.getAllBlocks().map(block => {
        block.markDirty();
        block.render();
      });
      // If this is an embedded workspace, we resize its container to avoid cropping or excess padding.
      if (Blockly.embeddedWorkspaces.includes(workspace.id)) {
        shrinkBlockSpaceContainer(workspace, true);
      }
      // Adjust the width of the vertical flyout if it exists.
      if (workspace.getFlyout()) {
        workspace.getFlyout()!.reflow();
      }
    }
  }
}

export function setWorkspaceTheme(name: string) {
  // Save the theme to user preferences, falling back to localStorage for signed-out users.
  new UserPreferences().setBlocklyTheme(name, () =>
    localStorage.setItem(BLOCKLY_THEME, name)
  );

  const analyticsData = Blockly.analyticsData;
  analyticsReporter.sendEvent(EVENTS.BLOCKLY_LAB_SETTING_CHANGED, {
    setting: EVENTS.BLOCKLY_SETTING_THEME,
    value: name,
    ...analyticsData,
  });

  const currentTheme = Blockly.getMainWorkspace().getTheme();
  const themeName = name + (isDarkTheme(currentTheme) ? DARK_THEME_SUFFIX : '');
  setAllWorkspacesTheme(Blockly.themes[themeName as Themes], currentTheme);
}

export function setAllWorkspacesTheme(
  newTheme: BlocklyCore.Theme,
  previousTheme: BlocklyCore.Theme | undefined
) {
  Blockly.Workspace.getAll().forEach(baseWorkspace => {
    // Headless workspaces do not have the ability to set the theme.
    const workspace = baseWorkspace as BlocklyCore.WorkspaceSvg;
    setThemeAndRenderBlocks(workspace, newTheme, previousTheme);
  });
}
