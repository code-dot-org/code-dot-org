import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import React, {useCallback} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sentinel option value for "create a new scene" (scene ids are uuids, so no
// collision).
const NEW_SCENE_VALUE = '__new_scene__';

interface SceneSelectorProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  // Scene switching only makes sense while the Code tab is showing.
  disabled?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string) => void;
}

/**
 * Scene picker in the workspace header (scenes UI variant): choose which
 * scene's code workspace is open in the Code tab, or create a new scene via
 * the option at the bottom. Scene names are labels only; the ids underneath
 * are the source of truth.
 */
const SceneSelector: React.FunctionComponent<SceneSelectorProps> = ({
  scenes,
  activeSceneId,
  disabled,
  onSelectScene,
  onCreateScene,
}) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === NEW_SCENE_VALUE) {
        // TODO: replace with a design-system dialog; prompt() is placeholder
        // chrome for the experiment.
        const name = window.prompt('Name your new scene:');
        if (name && name.trim()) {
          onCreateScene(name.trim());
        }
        // If cancelled, the controlled value snaps back to the active scene.
      } else {
        onSelectScene(value);
      }
    },
    [onSelectScene, onCreateScene]
  );

  return (
    <SimpleDropdown
      name="spritelab2-scene"
      className={moduleStyles.sceneSelect}
      items={[
        ...scenes.map(scene => ({value: scene.id, text: scene.name})),
        {value: NEW_SCENE_VALUE, text: '＋ New scene…'},
      ]}
      selectedValue={activeSceneId ?? ''}
      onChange={handleChange}
      disabled={disabled}
      labelText="Scene"
      isLabelVisible={false}
      size="xs"
    />
  );
};

export default SceneSelector;
