import Dialog from '@code-dot-org/component-library/dialog';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useState} from 'react';

import {SceneMetadata} from '../redux/spriteLab2Redux';
import {SceneType} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

// Sentinel option value for "create a new scene" (scene ids are uuids, so no
// collision).
const NEW_SCENE_VALUE = '__new_scene__';

// What each scene type is called for a student choosing one.
const SCENE_TYPE_LABELS: {value: SceneType; label: string}[] = [
  {value: 'story', label: 'A story'},
  {value: 'platform', label: 'A platformer'},
];

interface SceneSelectorProps {
  scenes: SceneMetadata[];
  activeSceneId: string | null;
  // Disabled off the scene tabs, where switching has no effect.
  disabled?: boolean;
  // Locked to the current scene: disallows changing or creating scenes.
  locked?: boolean;
  onSelectScene: (sceneId: string) => void;
  onCreateScene: (name: string, type: SceneType) => void;
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
  // A scene's type decides the blocks it offers and how big its sprites are,
  // so it is chosen once, here, rather than changed later.
  const [newType, setNewType] = useState<SceneType>('story');

  const closeDialog = useCallback(() => {
    setNaming(false);
    setNewName('');
    setNewType('story');
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
      onCreateScene(name, newType);
    }
    closeDialog();
  }, [newName, newType, onCreateScene, closeDialog]);

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
            <div className={moduleStyles.newSceneFields}>
              <TextField
                name="sceneName"
                label="Scene name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <fieldset className={moduleStyles.sceneTypeGroup}>
                <legend>What is this scene for?</legend>
                {SCENE_TYPE_LABELS.map(({value, label}) => (
                  <RadioButton
                    key={value}
                    name="sceneType"
                    value={value}
                    label={label}
                    size="s"
                    checked={newType === value}
                    onChange={() => setNewType(value)}
                  />
                ))}
              </fieldset>
            </div>
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
