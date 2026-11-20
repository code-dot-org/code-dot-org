// A dot beside each toolbox block added from the new-block catalog that the
// student's project has not used. A used block wears nothing, and stays
// bare for the visit even if the student deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useMemo, useState} from 'react';

import {installFlyoutDots} from '../blockly/flyoutDots';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

export function useBlockTypesUsedThisVisit(
  scenes: Scene[]
): ReadonlySet<string> {
  const used = useMemo(() => usedBlockTypes(scenes), [scenes]);
  const [usedThisVisit, setUsedThisVisit] = useState<ReadonlySet<string>>(
    new Set()
  );
  useEffect(() => {
    setUsedThisVisit(current =>
      [...used].every(type => current.has(type))
        ? current
        : new Set([...current, ...used])
    );
  }, [used]);
  return usedThisVisit;
}

export function useFlyoutDots({
  enabled,
  added,
  usedThisVisit,
  workspaceVersion,
  getWorkspace,
}: {
  enabled: boolean;
  /** Block types added from the catalog. */
  added: ReadonlySet<string>;
  usedThisVisit: ReadonlySet<string>;
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
}): void {
  useEffect(() => {
    if (!workspaceVersion || !enabled || added.size === 0) {
      return;
    }
    return installFlyoutDots(
      getWorkspace(),
      type => added.has(type) && !usedThisVisit.has(type)
    );
  }, [enabled, added, workspaceVersion, usedThisVisit, getWorkspace]);
}
