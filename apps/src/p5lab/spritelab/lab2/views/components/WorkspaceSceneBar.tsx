import {Button as MuiButton, buttonClasses, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import SceneDropdown, {SceneDropdownProps} from './SceneDropdown';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface WorkspaceSceneBarProps
  extends Omit<SceneDropdownProps, 'menuPlacement'> {
  /** Rendered at the bar's start. */
  startExtra?: React.ReactNode;
  /** Room kept clear of the preview's column. */
  style?: React.CSSProperties;
}

/**
 * The bar across the base of the editors (?bar=workspace): the
 * project-wide controls at the start, then at the end the scene dropdown,
 * opening upward, and All scenes.
 */
const WorkspaceSceneBar: React.FunctionComponent<WorkspaceSceneBarProps> = ({
  onManageScenes,
  startExtra,
  style,
  ...dropdown
}) => (
  <div className={moduleStyles.workspaceSceneBar} style={style}>
    <div className={moduleStyles.tabBar}>{startExtra}</div>
    <div className={moduleStyles.tabBar}>
      <SceneDropdown {...dropdown} menuPlacement="top" />
      {onManageScenes && (
        // aria-disabled, not disabled: a locked button stays in the tab
        // order, so its reason reaches keyboard users. The disabled look
        // takes no pointer events, so the span carries the hover.
        <Tooltip
          title={dropdown.locked ? dropdown.lockedReason : ''}
          describeChild
        >
          <span>
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              aria-disabled={dropdown.locked}
              className={classNames({
                [buttonClasses.disabled]: dropdown.locked,
              })}
              onClick={event => {
                if (dropdown.locked) {
                  return;
                }
                blurAfterPointerClick(event);
                onManageScenes();
              }}
            >
              All scenes
            </MuiButton>
          </span>
        </Tooltip>
      )}
    </div>
  </div>
);

export default WorkspaceSceneBar;
