import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import * as BlocklyCore from 'blockly/core';
import React, {useEffect, useState} from 'react';

import {
  installFlyoutFooterRoom,
  observeToolboxWidth,
  widenFlyoutMargin,
} from '../blockly/flyoutRoom';

import moduleStyles from './block-catalog.module.scss';

// The button's height plus its inset from the toolbox's bottom edge, which
// the flyout scrolls its last block clear of.
const FOOTER_PX = 44;
// Room in the flyout's margin for the dots beside added blocks.
const MARGIN_FACTOR = 2;
// A column narrower than this (a category list) gets the catalog's icon
// and the count alone.
const COMPACT_BELOW_PX = 180;

interface AddBlocksButtonProps {
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
  /** How many catalog blocks are still out of the toolbox. */
  remaining: number;
  onClick: () => void;
}

/**
 * The tinted band across the toolbox's foot, with the button that opens
 * the new-block catalog in its middle. It sits inside the toolbox column,
 * which is why its width follows the column's; the flyout gains room to
 * scroll its last block clear of it and a wider margin for the dots.
 */
const AddBlocksButton: React.FunctionComponent<AddBlocksButtonProps> = ({
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
    const undoMargin = widenFlyoutMargin(workspace, MARGIN_FACTOR);
    const undoRoom = installFlyoutFooterRoom(workspace, FOOTER_PX);
    const undoWidth = observeToolboxWidth(workspace, setWidth);
    return () => {
      undoMargin();
      undoRoom();
      undoWidth();
    };
  }, [workspaceVersion, getWorkspace]);

  if (!width) {
    return null;
  }
  const compact = width < COMPACT_BELOW_PX;
  const count = remaining > 0 && (
    <span className={moduleStyles.count} aria-hidden>
      {remaining}
    </span>
  );
  return (
    <div className={moduleStyles.toolboxFooter} style={{width}}>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        className={compact ? moduleStyles.compactButton : undefined}
        aria-label={
          remaining > 0
            ? `Discover blocks (${remaining} new)`
            : 'Discover blocks'
        }
        onClick={onClick}
      >
        {compact ? <FontAwesomeV6Icon iconName="compass" /> : 'Discover blocks'}
        {count}
      </MuiButton>
    </div>
  );
};

export default AddBlocksButton;
