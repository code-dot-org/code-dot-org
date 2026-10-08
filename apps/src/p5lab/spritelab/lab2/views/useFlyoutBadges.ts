// Badges on the toolbox blocks no earlier level of the unit offered (the
// server's newBlocks) that the student's project has not used: a "New"
// stamp, with the help button when the block has help, in one pill. A used
// block wears nothing, and stays bare for the visit even if the student
// deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useMemo, useState} from 'react';

import {BLOCK_HELP} from '../blockHelp/blockHelpContent';
import {FlyoutBadge, installFlyoutBadges} from '../blockly/flyoutBadges';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

const STAMP_TEXT = 'New';

export function useFlyoutBadges({
  enabled,
  newBlocks,
  scenes,
  workspaceVersion,
  getWorkspace,
  onOpenHelp,
  onInvalidate,
}: {
  enabled: boolean;
  /** Block types no earlier level of the unit offered. */
  newBlocks: readonly string[] | undefined;
  scenes: Scene[];
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
  onOpenHelp: (blockType: string, anchor: DOMRect) => void;
  onInvalidate: () => void;
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

  const fresh = useMemo(() => new Set(newBlocks ?? []), [newBlocks]);
  useEffect(() => {
    if (!workspaceVersion || !enabled || fresh.size === 0) {
      return;
    }
    const badgeFor = (type: string): FlyoutBadge | undefined => {
      if (!fresh.has(type) || seen.has(type)) {
        return undefined;
      }
      const entry = BLOCK_HELP[type];
      return {
        text: STAMP_TEXT,
        bright: !!entry?.standout,
        help: entry ? {title: entry.title} : undefined,
      };
    };
    const dispose = installFlyoutBadges(getWorkspace(), {
      badgeFor,
      onOpenHelp,
      onInvalidate,
    });
    return () => {
      dispose();
      // The badge an open callout pointed at is gone with the redraw.
      onInvalidate();
    };
  }, [
    enabled,
    fresh,
    workspaceVersion,
    seen,
    getWorkspace,
    onOpenHelp,
    onInvalidate,
  ]);
}
