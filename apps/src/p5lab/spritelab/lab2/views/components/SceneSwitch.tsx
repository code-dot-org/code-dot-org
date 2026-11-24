import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {SceneMetadata} from '@cdo/apps/p5lab/spritelab/lab2/redux/spriteLab2Redux';

import ScenePicture from '../ScenePicture';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface SceneSwitchProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  /** Whether a scene, rather than Images, is open: only then is the
      active scene's button pressed. */
  sceneOpen: boolean;
  /** New scene is off. */
  locked?: boolean;
  allowCreate?: boolean;
  onSelectScene: (sceneId: string) => void;
  /** Starts a new scene, which the host names. */
  onNewScene: () => void;
}

/**
 * ?scene-tabs=true: one button per scene with its picture, and a last one
 * that adds a scene. Drawn like the design system's segmented buttons,
 * which take only text and icons.
 */
const SceneSwitch: React.FunctionComponent<SceneSwitchProps> = ({
  scenes,
  activeSceneId,
  sceneOpen,
  locked = false,
  allowCreate = true,
  onSelectScene,
  onNewScene,
}) => (
  <div className={moduleStyles.sceneSwitch}>
    {scenes.map(scene => {
      const pressed = sceneOpen && scene.id === activeSceneId;
      return (
        <button
          key={scene.id}
          id={`scene-switch-${scene.id}`}
          type="button"
          aria-pressed={pressed}
          className={classNames(
            moduleStyles.sceneSwitchButton,
            pressed && moduleStyles.sceneSwitchPressed
          )}
          onClick={() => onSelectScene(scene.id)}
        >
          <ScenePicture
            src={scene.thumbnail}
            className={classNames(
              moduleStyles.sceneThumb,
              moduleStyles.sceneThumbSmall
            )}
          />
          <span className={moduleStyles.sceneTriggerName}>{scene.name}</span>
        </button>
      );
    })}
    {allowCreate && (
      <button
        id="scene-switch-new"
        type="button"
        aria-label="New scene"
        disabled={locked}
        className={moduleStyles.sceneSwitchButton}
        onClick={onNewScene}
      >
        <FontAwesomeV6Icon iconName="plus" iconStyle="solid" />
      </button>
    )}
  </div>
);

export default SceneSwitch;
