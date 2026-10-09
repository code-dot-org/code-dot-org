import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import * as BlocklyCore from 'blockly/core';
import React, {useEffect, useState} from 'react';

import {
  installFlyoutFooterRoom,
  installFlyoutMargin,
  observeFlyoutWidth,
} from '../blockly/flyoutRoom';

import moduleStyles from './block-catalog.module.scss';

// Matches .toolboxFooter's height in the stylesheet.
const FOOTER_PX = 56;
// Twice Blockly's own, so the dots beside added blocks have room.
const MARGIN_PX = 16;

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
 * catalog. It takes the flyout's width, and the flyout gains room to scroll
 * its last block clear of it and a wider margin for the dots.
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
    const undoMargin = installFlyoutMargin(workspace, MARGIN_PX);
    const undoRoom = installFlyoutFooterRoom(workspace, FOOTER_PX);
    const undoWidth = observeFlyoutWidth(workspace, setWidth);
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
        {remaining > 0 ? `Add new blocks (${remaining})` : 'New blocks'}
      </MuiButton>
    </div>
  );
};

export default AddBlocksButton;
