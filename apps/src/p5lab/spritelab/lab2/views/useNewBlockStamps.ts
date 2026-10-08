// A "New" stamp beside each toolbox block the student's project has never
// used. Once a block is used during the visit it stays unstamped, even if
// the student deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useMemo, useState} from 'react';

import {installFlyoutStamps} from '../blockly/flyoutStamps';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

const STAMP_TEXT = 'New';

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
  const used = useMemo(() => usedBlockTypes(scenes), [scenes]);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set());
  useEffect(() => {
    setSeen(current => {
      if ([...used].every(type => current.has(type))) {
        return current;
      }
      return new Set([...current, ...used]);
    });
  }, [used]);

  useEffect(() => {
    if (!enabled || !workspaceVersion) {
      return;
    }
    return installFlyoutStamps(getWorkspace(), type =>
      seen.has(type) ? undefined : STAMP_TEXT
    );
  }, [enabled, workspaceVersion, seen, getWorkspace]);
}
