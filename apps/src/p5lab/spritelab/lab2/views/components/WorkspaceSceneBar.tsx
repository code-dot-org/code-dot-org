import {useDropdownContext} from '@code-dot-org/component-library/common/contexts';
import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {SceneMetadata} from '../../redux/spriteLab2Redux';
import {SceneType} from '../../types';
import {blurAfterPointerClick} from '../blurAfterPointerClick';
import NewSceneDialog from '../NewSceneDialog';
import ScenePicture from '../ScenePicture';

import moduleStyles from '../sprite-lab2-view.module.scss';

// CustomDropdown derives its element ids from this.
const SCENE_DROPDOWN_NAME = 'workspace-scene';

interface SceneMenuProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  /** The New scene option at the menu's foot, when offered. */
  onNewScene?: () => void;
  /** New scene is off, with the reason on hover. */
  locked?: boolean;
  lockedReason?: string;
}

// Rendered inside the dropdown, where its context closes the menu.
const SceneMenu: React.FunctionComponent<SceneMenuProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onNewScene,
  locked,
  lockedReason,
}) => {
  const {activeDropdownName, setActiveDropdownName} = useDropdownContext();
  const choose = (action: () => void) => () => {
    setActiveDropdownName('');
    action();
  };
  // The dropdown closes itself on a bubbled mousedown outside. Blockly stops
  // pointerdown at the workspace and cancels it, so neither reaches the
  // document and a click on the blocks leaves the menu open. Listen in the
  // capture phase, ahead of Blockly.
  useEffect(() => {
    if (activeDropdownName !== SCENE_DROPDOWN_NAME) {
      return;
    }
    const closeOnOutsidePress = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.(`#${SCENE_DROPDOWN_NAME}-dropdown`)) {
        setActiveDropdownName('');
      }
    };
    document.addEventListener('pointerdown', closeOnOutsidePress, true);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePress, true);
  }, [activeDropdownName, setActiveDropdownName]);
  return (
    <ul className={moduleStyles.sceneMenu} aria-label="Scenes">
      {scenes.map(scene => (
        <li key={scene.id}>
          <button
            type="button"
            aria-current={scene.id === activeSceneId ? 'true' : undefined}
            className={classNames(
              moduleStyles.sceneMenuItem,
              scene.id === activeSceneId && moduleStyles.sceneMenuItemActive
            )}
            onClick={choose(() => onSelectScene(scene.id))}
          >
            <ScenePicture
              src={scene.thumbnail}
              className={moduleStyles.sceneThumb}
            />
            <span className={moduleStyles.sceneMenuName}>{scene.name}</span>
          </button>
        </li>
      ))}
      {onNewScene && (
        <>
          <li className={moduleStyles.sceneMenuDivider} role="presentation" />
          <li>
            <button
              type="button"
              className={moduleStyles.sceneMenuItem}
              disabled={locked}
              title={locked ? lockedReason : undefined}
              onClick={choose(onNewScene)}
            >
              <span className={moduleStyles.sceneMenuIcon}>
                <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
              </span>
              <span className={moduleStyles.sceneMenuName}>New scene…</span>
            </button>
          </li>
        </>
      )}
    </ul>
  );
};

interface WorkspaceSceneBarProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** New scene and All scenes are off, with the reason on hover. */
  locked?: boolean;
  lockedReason?: string;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  /** Opens the Scenes gallery; the bar offers it only when given. */
  onManageScenes?: () => void;
  /** Rendered at the bar's end. */
  rightExtra?: React.ReactNode;
  /** Room kept clear of the preview's column. */
  style?: React.CSSProperties;
}

/**
 * The bar across the base of the editors (?bar=workspace): a dropdown of
 * the scenes with their pictures, the current one marked and New scene at
 * its foot, then All scenes, with the project-wide controls at the end.
 */
const WorkspaceSceneBar: React.FunctionComponent<WorkspaceSceneBarProps> = ({
  scenes,
  activeSceneId,
  locked = false,
  lockedReason,
  allowCreate = true,
  onSelectScene,
  onCreateScene,
  onManageScenes,
  rightExtra,
  style,
}) => {
  const [naming, setNaming] = useState(false);
  const active = scenes.find(scene => scene.id === activeSceneId);
  return (
    <div className={moduleStyles.workspaceSceneBar} style={style}>
      <div className={moduleStyles.tabBar}>
        <CustomDropdown
          name={SCENE_DROPDOWN_NAME}
          className={moduleStyles.sceneDropdown}
          size="s"
          labelText="Scene"
          aria-label={`Scene: ${active?.name ?? ''}`}
          menuVerticalPlacement="top"
          useMuiButtonAsTrigger
          triggerButtonProps={{
            variant: 'outlined',
            color: 'secondary',
            size: 'small',
            className: moduleStyles.sceneTrigger,
            children: (
              <>
                <ScenePicture
                  src={active?.thumbnail}
                  className={classNames(
                    moduleStyles.sceneThumb,
                    moduleStyles.sceneThumbSmall
                  )}
                />
                <span className={moduleStyles.sceneTriggerName}>
                  {active?.name ?? ''}
                </span>
                <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-up" />
              </>
            ),
          }}
        >
          <SceneMenu
            scenes={scenes}
            activeSceneId={activeSceneId}
            onSelectScene={onSelectScene}
            onNewScene={allowCreate ? () => setNaming(true) : undefined}
            locked={locked}
            lockedReason={lockedReason}
          />
        </CustomDropdown>
        {onManageScenes && (
          <button
            type="button"
            disabled={locked}
            title={locked ? lockedReason : undefined}
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
      {naming && (
        <NewSceneDialog
          onCreate={onCreateScene}
          onClose={() => setNaming(false)}
        />
      )}
    </div>
  );
};

export default WorkspaceSceneBar;
