// A "New" stamp beside each toolbox block the student's project has never
// used. Once a block is used during the visit it stays unstamped, even if
// the student deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useRef} from 'react';

import {installFlyoutStamps} from '../blockly/flyoutStamps';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

export const NEW_STAMP_TEXT = 'New';

export function useNewBlockStamps({
  enabled,
  scenes,
  workspaceVersion,
  getWorkspace,
}: {
  enabled: boolean;
  scenes: Scene[];
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
}): void {
  const seen = useRef(new Set<string>());
  usedBlockTypes(scenes).forEach(type => seen.current.add(type));
  // Re-stamp when the set of used blocks grows.
  const seenKey = [...seen.current].sort().join(',');

  useEffect(() => {
    if (!enabled || !workspaceVersion) {
      return;
    }
    const used = new Set(seenKey.split(',').filter(Boolean));
    return installFlyoutStamps(getWorkspace(), type =>
      used.has(type) ? undefined : NEW_STAMP_TEXT
    );
  }, [enabled, workspaceVersion, seenKey, getWorkspace]);
}
