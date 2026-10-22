import * as BlocklyCore from 'blockly/core';
import React, {useEffect, useState} from 'react';

import {
  installFlyoutFooterRoom,
  observeToolboxWidth,
} from '../blockly/flyoutRoom';

import DiscoverBlocksButton from './DiscoverBlocksButton';

import moduleStyles from './block-catalog.module.scss';

// The button's height plus its inset from the toolbox's bottom edge, which
// the flyout scrolls its last block clear of.
const FOOTER_PX = 44;
// A column narrower than this (a category list) gets the catalog's icon
// and the count alone.
const COMPACT_BELOW_PX = 180;

interface CatalogBandProps {
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
  /** How many catalog blocks are still out of the toolbox. */
  remaining: number;
  onClick: () => void;
}

/**
 * The tinted band across the toolbox's foot, with the button that opens
 * the new-block catalog in its middle, for the layouts without a scene
 * bar under the workspace. It sits inside the toolbox column, which is
 * why its width follows the column's; the flyout gains room to scroll its
 * last block clear of it.
 */
const CatalogBand: React.FunctionComponent<CatalogBandProps> = ({
  workspaceVersion,
  getWorkspace,
  remaining,
  onClick,
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!workspaceVersion) {
      return;
    }
    const workspace = getWorkspace();
    const undoRoom = installFlyoutFooterRoom(workspace, FOOTER_PX);
    const undoWidth = observeToolboxWidth(workspace, setWidth);
    return () => {
      undoRoom();
      undoWidth();
    };
  }, [workspaceVersion, getWorkspace]);

  if (!width) {
    return null;
  }
  return (
    <div
      className={moduleStyles.toolboxFooter}
      style={{width, height: FOOTER_PX}}
    >
      <DiscoverBlocksButton
        remaining={remaining}
        compact={width < COMPACT_BELOW_PX}
        onClick={onClick}
      />
    </div>
  );
};

export default CatalogBand;
