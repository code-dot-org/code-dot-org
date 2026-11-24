import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton, Tooltip} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {SceneMetadata} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

import ScenePicture from '../ScenePicture';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface SceneSidebarProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** New scene and All scenes show but are disabled, with this reason on
      hover. */
  locked?: boolean;
  lockedReason?: string;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  /** Called by New scene; the caller asks for the new scene's name. */
  onNewScene: () => void;
  onManageScenes?: () => void;
  className?: string;
}

/** ?world-block=true: the project's scenes listed down the left of the
    code; click one to edit its code. */
const SceneSidebar: React.FunctionComponent<SceneSidebarProps> = ({
  scenes,
  activeSceneId,
  locked = false,
  lockedReason,
  allowCreate = true,
  onSelectScene,
  onNewScene,
  onManageScenes,
  className,
}) => (
  <nav
    aria-label="Scenes"
    className={classNames(moduleStyles.sceneSidebar, className)}
  >
    <ul className={moduleStyles.sceneSidebarList}>
      {scenes.map(scene => (
        <li key={scene.id}>
          <button
            type="button"
            aria-current={scene.id === activeSceneId}
            className={classNames(
              moduleStyles.sceneSidebarItem,
              scene.id === activeSceneId && moduleStyles.sceneSidebarItemActive
            )}
            onClick={() => onSelectScene(scene.id)}
          >
            <ScenePicture
              src={scene.thumbnail}
              className={moduleStyles.sceneSidebarPicture}
            />
            <span className={moduleStyles.sceneSidebarName}>{scene.name}</span>
          </button>
        </li>
      ))}
    </ul>
    {(allowCreate || onManageScenes) && (
      <Tooltip title={locked ? lockedReason : ''} describeChild>
        <div className={moduleStyles.sceneSidebarActions}>
          {allowCreate && (
            <MuiButton
              variant="outlined"
              color="secondary"
              size="small"
              disabled={locked}
              startIcon={<FontAwesomeV6Icon iconName="plus" />}
              onClick={onNewScene}
            >
              New scene
            </MuiButton>
          )}
          {onManageScenes && (
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              disabled={locked}
              onClick={onManageScenes}
            >
              All scenes
            </MuiButton>
          )}
        </div>
      </Tooltip>
    )}
  </nav>
);

export default SceneSidebar;
