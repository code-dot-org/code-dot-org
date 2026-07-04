import React, {useCallback} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sentinel option value for "create a new scene" (scene ids are uuids, so no
// collision).
const NEW_SCENE_VALUE = '__new_scene__';

interface SceneSelectorProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string) => void;
}

/**
 * Scene picker in the tab bar (scenes UI variant): choose which scene's code
 * workspace is open in the Code tab, or create a new scene via the option at
 * the bottom. Scene names are labels only; the ids underneath are the source
 * of truth.
 */
const SceneSelector: React.FunctionComponent<SceneSelectorProps> = ({
  scenes,
  activeSceneId,
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
    <select
      className={moduleStyles.sceneSelect}
      value={activeSceneId ?? ''}
      onChange={handleChange}
      aria-label="Scene"
    >
      {scenes.map(scene => (
        <option key={scene.id} value={scene.id}>
          {scene.name}
        </option>
      ))}
      <option value={NEW_SCENE_VALUE}>＋ New scene…</option>
    </select>
  );
};

export default SceneSelector;
