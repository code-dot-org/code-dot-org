// A badge beside each toolbox block the student's project has not used:
// on a level with the new-block catalog, a dot beside each block added from
// it; otherwise, beside each block no earlier level of the unit offered (the
// server's newBlocks) that has help, a filled circle with a question mark
// that opens the help. A used block wears nothing, and stays bare for the
// visit even if the student deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useMemo, useState} from 'react';

import {BLOCK_HELP} from '../blockHelp/blockHelpContent';
import {FlyoutBadge, installFlyoutBadges} from '../blockly/flyoutBadges';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

export function useFlyoutBadges({
  enabled,
  newBlocks,
  dotsFor,
  scenes,
  workspaceVersion,
  getWorkspace,
  onOpenHelp,
  onInvalidate,
}: {
  enabled: boolean;
  /** Block types no earlier level of the unit offered. */
  newBlocks: readonly string[] | undefined;
  /** Set on a catalog level: the blocks added from the catalog, which get
      dots instead of help badges. */
  dotsFor?: ReadonlySet<string>;
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
    setSeen(current =>
      [...used].every(type => current.has(type))
        ? current
        : new Set([...current, ...used])
    );
  }, [used]);

  const fresh = useMemo(() => new Set(newBlocks ?? []), [newBlocks]);
  useEffect(() => {
    const marked = dotsFor ?? fresh;
    if (!workspaceVersion || !enabled || marked.size === 0) {
      return;
    }
    const badgeFor = (type: string): FlyoutBadge | undefined => {
      if (!marked.has(type) || seen.has(type)) {
        return undefined;
      }
      if (dotsFor) {
        return {kind: 'dot'};
      }
      const entry = BLOCK_HELP[type];
      return entry
        ? {kind: 'help', title: entry.title, bright: !!entry.standout}
        : undefined;
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
    dotsFor,
    workspaceVersion,
    seen,
    getWorkspace,
    onOpenHelp,
    onInvalidate,
  ]);
}
