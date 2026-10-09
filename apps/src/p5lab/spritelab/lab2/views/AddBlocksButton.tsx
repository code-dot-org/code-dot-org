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

// Matches .toolboxFooter's height in the stylesheet.
const FOOTER_PX = 56;
// Room in the flyout's margin for the dots beside added blocks.
const MARGIN_FACTOR = 2;

interface AddBlocksButtonProps {
  /** Bumps when the workspace is re-injected. */
  workspaceVersion: number;
  getWorkspace: () => BlocklyCore.WorkspaceSvg | null | undefined;
  /** How many catalog blocks are still out of the toolbox. */
  remaining: number;
  onClick: () => void;
}

/**
 * The bar pinned over the bottom of the toolbox that opens the new-block
 * catalog. It takes the toolbox column's width, and the flyout gains room
 * to scroll its last block clear of it and a wider margin for the dots.
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
  return (
    <div className={moduleStyles.toolboxFooter} style={{width}}>
      <MuiButton
        variant="contained"
        color="primary"
        size="small"
        className={moduleStyles.toolboxFooterButton}
        startIcon={<FontAwesomeV6Icon iconName="plus" />}
        onClick={onClick}
      >
        {remaining > 0 ? `Add new blocks (${remaining})` : 'Add new blocks'}
      </MuiButton>
    </div>
  );
};

export default AddBlocksButton;
