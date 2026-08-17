import Dialog from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sentinel option value for "create a new scene" (scene ids are uuids, so no
// collision).
const NEW_SCENE_VALUE = '__new_scene__';

interface SceneSelectorProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  // Disabled off the scene tabs, where switching has no effect.
  disabled?: boolean;
  // Pinned-scene levels (fixed_scene_id) edit one scene only: show its name
  // without the picker or the new-scene option.
  locked?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string) => void;
}

/**
 * Scene picker in the tab bar: choose which scene the World and Code sub-tabs
 * operate on, or create a new scene via the option at the bottom (which opens
 * a naming dialog). Scene names are labels only; the ids underneath are the
 * source of truth.
 */
const SceneSelector: React.FunctionComponent<SceneSelectorProps> = ({
  scenes,
  activeSceneId,
  disabled,
  locked,
  onSelectScene,
  onCreateScene,
}) => {
  const [naming, setNaming] = useState(false);
  const [newName, setNewName] = useState('');

  const closeDialog = useCallback(() => {
    setNaming(false);
    setNewName('');
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (e.target.value === NEW_SCENE_VALUE) {
        // Open the naming dialog; the controlled value snaps back to the active
        // scene until a new one is actually created.
        setNaming(true);
      } else {
        onSelectScene(e.target.value);
      }
    },
    [onSelectScene]
  );

  const handleCreate = useCallback(() => {
    const name = newName.trim();
    if (name) {
      onCreateScene(name);
    }
    closeDialog();
  }, [newName, onCreateScene, closeDialog]);

  if (locked) {
    return (
      <span className={moduleStyles.sceneName}>
        {scenes.find(scene => scene.id === activeSceneId)?.name ?? ''}
      </span>
    );
  }

  return (
    <>
      <select
        className={moduleStyles.sceneSelect}
        value={activeSceneId ?? ''}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Scene"
      >
        {scenes.map(scene => (
          <option key={scene.id} value={scene.id}>
            {scene.name}
          </option>
        ))}
        <option value={NEW_SCENE_VALUE}>＋ New scene…</option>
      </select>
      {naming && (
        <Dialog
          title="New scene"
          onClose={closeDialog}
          customContent={
            <TextField
              name="sceneName"
              label="Scene name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          }
          primaryButtonProps={{
            children: 'Create',
            size: 'small',
            disabled: !newName.trim(),
            onClick: handleCreate,
          }}
          secondaryButtonProps={{
            children: 'Cancel',
            size: 'small',
            color: 'tertiary',
            variant: 'outlined',
            onClick: closeDialog,
          }}
        />
      )}
    </>
  );
};

export default SceneSelector;
