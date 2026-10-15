import * as BlocklyCore from 'blockly/core';
import {useEffect, useState} from 'react';

import {BlockStyles, WORKSPACE_EVENTS} from '@cdo/apps/blockly/constants';

const getSetupBlockColor = (): string | null => {
  // The global may be absent (pages without Blockly) or a partial stub.
  if (
    typeof Blockly === 'undefined' ||
    typeof Blockly.getMainWorkspace !== 'function'
  ) {
    return null;
  }
  const theme = Blockly.getMainWorkspace()?.getTheme();
  return theme?.blockStyles?.[BlockStyles.SETUP]?.colourPrimary ?? null;
};

/**
 * The main workspace's setup ("when run") block color, kept current across
 * Blockly theme changes, or null when the page has no Blockly workspace.
 * Lets a Run button stay matched with the when-run block.
 */
export function useSetupBlockColor(): string | null {
  const [color, setColor] = useState<string | null>(getSetupBlockColor);

  useEffect(() => {
    let workspace: BlocklyCore.WorkspaceSvg | undefined;
    const onWorkspaceEvent = (event: BlocklyCore.Events.Abstract) => {
      if (event.type === BlocklyCore.Events.THEME_CHANGE) {
        setColor(getSetupBlockColor());
      }
    };
    const detach = () => {
      workspace?.removeChangeListener(onWorkspaceEvent);
      workspace = undefined;
    };
    // The main workspace may not exist yet (buttons usually mount before
    // injection) and is replaced when a level re-injects, so attach runs
    // both at mount and on the wrapper's workspace-created event.
    const attach = () => {
      detach();
      if (
        typeof Blockly === 'undefined' ||
        typeof Blockly.getMainWorkspace !== 'function'
      ) {
        return;
      }
      workspace = Blockly.getMainWorkspace() as
        | BlocklyCore.WorkspaceSvg
        | undefined;
      workspace?.addChangeListener(onWorkspaceEvent);
      setColor(getSetupBlockColor());
    };
    attach();
    document.addEventListener(
      WORKSPACE_EVENTS.MAIN_BLOCK_SPACE_CREATED,
      attach
    );
    return () => {
      document.removeEventListener(
        WORKSPACE_EVENTS.MAIN_BLOCK_SPACE_CREATED,
        attach
      );
      detach();
    };
  }, []);

  return color;
}
