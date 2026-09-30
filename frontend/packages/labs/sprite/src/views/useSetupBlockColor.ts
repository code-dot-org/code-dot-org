import * as BlocklyCore from 'blockly/core';
import {useEffect, useState} from 'react';

import {BlockStyles} from '../blockly/constants';

const setupBlockColorOf = (
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
): string | null =>
  workspace?.getTheme()?.blockStyles?.[BlockStyles.SETUP]?.colourPrimary ??
  null;

/**
 * The workspace's setup ("when run") block color, kept current across theme
 * changes, or null without a workspace. Lets a Run button stay matched with
 * the when-run block. Apps found the main workspace through its Blockly
 * wrapper's creation event; here the view passes the workspace it made.
 */
export function useSetupBlockColor(
  workspace: BlocklyCore.WorkspaceSvg | null | undefined,
): string | null {
  const [color, setColor] = useState<string | null>(() =>
    setupBlockColorOf(workspace),
  );

  useEffect(() => {
    setColor(setupBlockColorOf(workspace));
    if (!workspace) {
      return;
    }
    const onWorkspaceEvent = (event: BlocklyCore.Events.Abstract) => {
      if (event.type === BlocklyCore.Events.THEME_CHANGE) {
        setColor(setupBlockColorOf(workspace));
      }
    };
    workspace.addChangeListener(onWorkspaceEvent);
    return () => workspace.removeChangeListener(onWorkspaceEvent);
  }, [workspace]);

  return color;
}
