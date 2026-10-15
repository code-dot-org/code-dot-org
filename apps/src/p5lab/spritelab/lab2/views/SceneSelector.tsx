import {useDropdownContext} from '@code-dot-org/component-library/common/contexts';
import {CustomDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneType} from '../types';

import NewSceneDialog from './NewSceneDialog';
import ScenePicture from './ScenePicture';

import moduleStyles from './sprite-lab2-view.module.scss';

// CustomDropdown derives its element ids from this.
const SCENE_DROPDOWN_NAME = 'scene';

interface SceneSelectorProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  // Disabled off the scene tabs, where switching has no effect.
  disabled?: boolean;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
  /** Opens the Scenes gallery; the menu offers it only when given. */
  onManageScenes?: () => void;
  /** The chip goes straight to the gallery instead of opening the menu
      (the ?scenes=gallery variant, for comparing the two). */
  chipOpensGallery?: boolean;
}

/** A scene's picture at menu or chip size. */
const SceneThumb: React.FunctionComponent<{
  scene: SceneMetadata | undefined;
  small?: boolean;
}> = ({scene, small}) => (
  <ScenePicture
    src={scene?.thumbnail}
    className={classNames(
      moduleStyles.sceneThumb,
      small && moduleStyles.sceneThumbSmall
    )}
  />
);

interface SceneMenuProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  allowCreate: boolean;
  onSelectScene: (sceneId: string) => void;
  onNewScene: () => void;
  onManageScenes?: () => void;
}

// Rendered inside the dropdown, where its context closes the menu.
const SceneMenu: React.FunctionComponent<SceneMenuProps> = ({
  scenes,
  activeSceneId,
  allowCreate,
  onSelectScene,
  onNewScene,
  onManageScenes,
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
            <SceneThumb scene={scene} />
            <span className={moduleStyles.sceneMenuName}>{scene.name}</span>
          </button>
        </li>
      ))}
      {(allowCreate || onManageScenes) && (
        <li className={moduleStyles.sceneMenuDivider} role="presentation" />
      )}
      {allowCreate && (
        <li>
          <button
            type="button"
            className={moduleStyles.sceneMenuItem}
            onClick={choose(onNewScene)}
          >
            <span className={moduleStyles.sceneMenuIcon}>
              <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
            </span>
            <span className={moduleStyles.sceneMenuName}>New scene…</span>
          </button>
        </li>
      )}
      {onManageScenes && (
        <li>
          <button
            type="button"
            className={moduleStyles.sceneMenuItem}
            onClick={choose(onManageScenes)}
          >
            <span className={moduleStyles.sceneMenuIcon}>
              <FontAwesomeV6Icon iconName="table-cells" iconStyle="solid" />
            </span>
            <span className={moduleStyles.sceneMenuName}>Manage scenes…</span>
          </button>
        </li>
      )}
    </ul>
  );
};

/**
 * Scene picker in the tab bar: choose which scene the World and Code sub-tabs
 * operate on, each shown with its picture; make a new scene via the option
 * at the bottom (which opens a naming dialog); or open the Scenes gallery.
 * Scene names are labels only; the ids underneath are the source of truth.
 */
const SceneSelector: React.FunctionComponent<SceneSelectorProps> = ({
  scenes,
  activeSceneId,
  disabled,
  allowCreate = true,
  onSelectScene,
  onCreateScene,
  onManageScenes,
  chipOpensGallery = false,
}) => {
  const [naming, setNaming] = useState(false);
  const active = scenes.find(s => s.id === activeSceneId);
  const chipContent = (
    <>
      <SceneThumb scene={active} small />
      <span className={moduleStyles.sceneTriggerName}>
        {active?.name ?? ''}
      </span>
      <FontAwesomeV6Icon iconStyle="solid" iconName="chevron-down" />
    </>
  );

  return (
    <>
      {chipOpensGallery && onManageScenes ? (
        <div className={moduleStyles.sceneDropdown}>
          <MuiButton
            variant="text"
            color="secondary"
            size="extraSmall"
            className={moduleStyles.sceneTrigger}
            aria-label={`Scene: ${active?.name ?? ''}. Manage scenes`}
            disabled={disabled}
            onClick={onManageScenes}
          >
            {chipContent}
          </MuiButton>
        </div>
      ) : (
        <CustomDropdown
          name={SCENE_DROPDOWN_NAME}
          className={moduleStyles.sceneDropdown}
          size="s"
          labelText="Scene"
          aria-label={`Scene: ${active?.name ?? ''}`}
          disabled={disabled}
          useMuiButtonAsTrigger
          triggerButtonProps={{
            variant: 'text',
            color: 'secondary',
            size: 'extraSmall',
            className: moduleStyles.sceneTrigger,
            children: chipContent,
          }}
        >
          <SceneMenu
            scenes={scenes}
            activeSceneId={activeSceneId}
            allowCreate={allowCreate}
            onSelectScene={onSelectScene}
            onNewScene={() => setNaming(true)}
            onManageScenes={onManageScenes}
          />
        </CustomDropdown>
      )}
      {naming && (
        <NewSceneDialog
          onCreate={onCreateScene}
          onClose={() => setNaming(false)}
        />
      )}
    </>
  );
};

export default SceneSelector;
