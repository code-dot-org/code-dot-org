import React from 'react';

import {blurAfterPointerClick} from '../blurAfterPointerClick';

import SceneDropdown, {SceneDropdownProps} from './SceneDropdown';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface WorkspaceSceneBarProps
  extends Omit<SceneDropdownProps, 'menuPlacement'> {
  /** Rendered at the bar's end. */
  rightExtra?: React.ReactNode;
  /** Room kept clear of the preview's column. */
  style?: React.CSSProperties;
}

/**
 * The bar across the base of the editors (?bar=workspace): the scene
 * dropdown, opening upward, then All scenes, with the project-wide
 * controls at the end.
 */
const WorkspaceSceneBar: React.FunctionComponent<WorkspaceSceneBarProps> = ({
  onManageScenes,
  rightExtra,
  style,
  ...dropdown
}) => (
  <div className={moduleStyles.workspaceSceneBar} style={style}>
    <div className={moduleStyles.tabBar}>
      <SceneDropdown {...dropdown} menuPlacement="top" />
      {onManageScenes && (
        <button
          type="button"
          disabled={dropdown.locked}
          title={dropdown.locked ? dropdown.lockedReason : undefined}
          className={moduleStyles.sceneTabBack}
          onClick={event => {
            blurAfterPointerClick(event);
            onManageScenes();
          }}
        >
          <span className={moduleStyles.sceneTabName} data-label="All scenes">
            All scenes
          </span>
        </button>
      )}
    </div>
    <div className={moduleStyles.tabBar}>{rightExtra}</div>
  </div>
);

export default WorkspaceSceneBar;
