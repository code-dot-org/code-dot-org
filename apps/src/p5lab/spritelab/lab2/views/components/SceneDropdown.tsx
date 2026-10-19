import {useDropdownContext} from '@code-dot-org/component-library/common/contexts';
import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {SceneMetadata} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';
import {SceneType} from '@cdo/apps/p5lab/spritelab/lab2/types';

import NewSceneDialog from '../NewSceneDialog';
import ScenePicture from '../ScenePicture';

import moduleStyles from '../sprite-lab2-view.module.scss';

// CustomDropdown derives its element ids from this.
const SCENE_DROPDOWN_NAME = 'scene-dropdown';

interface SceneMenuProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  /** The options under the scenes, when offered. */
  onNewScene?: () => void;
  onManageScenes?: () => void;
  /** New scene and All scenes are off, with the reason on hover. */
  locked?: boolean;
  lockedReason?: string;
}

// Rendered inside the dropdown, where its context closes the menu.
const SceneMenu: React.FunctionComponent<SceneMenuProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onNewScene,
  onManageScenes,
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
  const option = (text: string, icon: string, action: () => void) => (
    <li>
      <button
        type="button"
        className={moduleStyles.sceneMenuItem}
        disabled={locked}
        title={locked ? lockedReason : undefined}
        onClick={choose(action)}
      >
        <span className={moduleStyles.sceneMenuIcon}>
          <FontAwesomeV6Icon iconName={icon} iconStyle="solid" />
        </span>
        <span className={moduleStyles.sceneMenuName}>{text}</span>
      </button>
    </li>
  );
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
      {(onNewScene || onManageScenes) && (
        <li className={moduleStyles.sceneMenuDivider} role="presentation" />
      )}
      {onNewScene && option('New scene…', 'plus', onNewScene)}
      {onManageScenes && option('All scenes…', 'table-cells', onManageScenes)}
    </ul>
  );
};

export interface SceneDropdownProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** New scene and All scenes are off, with the reason on hover. */
  locked?: boolean;
  lockedReason?: string;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  /** Opens the Scenes gallery from the menu; left out, the menu has no
      such option. */
  onManageScenes?: () => void;
  /** Where the menu opens. */
  menuPlacement?: 'top' | 'bottom';
}

/**
 * A dropdown of the scenes with their pictures, the current one marked,
 * with New scene and All scenes at its foot when offered.
 */
const SceneDropdown: React.FunctionComponent<SceneDropdownProps> = ({
  scenes,
  activeSceneId,
  locked = false,
  lockedReason,
  allowCreate = true,
  onSelectScene,
  onCreateScene,
  onManageScenes,
  menuPlacement = 'bottom',
}) => {
  const [naming, setNaming] = useState(false);
  const active = scenes.find(scene => scene.id === activeSceneId);
  return (
    <>
      <CustomDropdown
        name={SCENE_DROPDOWN_NAME}
        className={moduleStyles.sceneDropdown}
        size="s"
        labelText="Scene"
        aria-label={`Scene: ${active?.name ?? ''}`}
        menuVerticalPlacement={menuPlacement}
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
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName={
                  menuPlacement === 'top' ? 'chevron-up' : 'chevron-down'
                }
              />
            </>
          ),
        }}
      >
        <SceneMenu
          scenes={scenes}
          activeSceneId={activeSceneId}
          onSelectScene={onSelectScene}
          onNewScene={allowCreate ? () => setNaming(true) : undefined}
          onManageScenes={onManageScenes}
          locked={locked}
          lockedReason={lockedReason}
        />
      </CustomDropdown>
      {naming && (
        <NewSceneDialog
          onCreate={onCreateScene}
          onClose={() => setNaming(false)}
        />
      )}
    </>
  );
};

export default SceneDropdown;
