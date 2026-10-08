// Badges on the toolbox's blocks the student's project has never used: a
// "New" stamp, a help button when the block has help, or one pill holding
// both. A block the student has used wears nothing, and stays bare for the
// visit even if the student deletes it again.

import * as BlocklyCore from 'blockly/core';
import {useEffect, useMemo, useState} from 'react';

import {BLOCK_HELP} from '../blockHelp/blockHelpContent';
import {FlyoutBadge, installFlyoutBadges} from '../blockly/flyoutBadges';
import {usedBlockTypes} from '../newBlocks';
import {Scene} from '../types';

const STAMP_TEXT = 'New';

export function useFlyoutBadges({
  stamps,
  help,
  scenes,
  workspaceVersion,
  getWorkspace,
  onOpenHelp,
  onInvalidate,
}: {
  /** Stamp unused blocks. */
  stamps: boolean;
  /** Offer help buttons. */
  help: boolean;
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

  useEffect(() => {
    if (!workspaceVersion || (!stamps && !help)) {
      return;
    }
    const badgeFor = (type: string): FlyoutBadge | undefined => {
      if (seen.has(type)) {
        return undefined;
      }
      const entry = help ? BLOCK_HELP[type] : undefined;
      const badge: FlyoutBadge = {
        text: stamps ? STAMP_TEXT : undefined,
        bright: !!BLOCK_HELP[type]?.standout,
        help: entry ? {title: entry.title} : undefined,
      };
      return badge.text || badge.help ? badge : undefined;
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
    stamps,
    help,
    workspaceVersion,
    seen,
    getWorkspace,
    onOpenHelp,
    onInvalidate,
  ]);
}
