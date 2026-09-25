import {MuiDialog} from '@code-dot-org/component-library/dialog';
import RadioButton from '@code-dot-org/component-library/radioButton';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useState} from 'react';

import {SceneType} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

export const SCENE_NAME_MAX_LENGTH = 40;

// What each scene type is called for a student choosing one.
const SCENE_TYPE_LABELS: {value: SceneType; label: string}[] = [
  {value: 'story', label: 'A story'},
  {value: 'platform', label: 'A platformer'},
];

interface NewSceneDialogProps {
  onCreate: (name: string, type: SceneType) => void;
  onClose: () => void;
}

/**
 * Names a new scene and picks its type. A scene's type decides the blocks it
 * offers and how big its sprites are, so it is chosen once, here, rather
 * than changed later.
 */
const NewSceneDialog: React.FunctionComponent<NewSceneDialogProps> = ({
  onCreate,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<SceneType>('story');

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed, type);
    }
    onClose();
  }, [name, type, onCreate, onClose]);

  return (
    <MuiDialog
      title="New scene"
      onClose={onClose}
      customContent={
        <div className={moduleStyles.newSceneFields}>
          <TextField
            name="sceneName"
            label="Scene name"
            value={name}
            maxLength={SCENE_NAME_MAX_LENGTH}
            onChange={e => setName(e.target.value)}
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
                checked={type === value}
                onChange={() => setType(value)}
              />
            ))}
          </fieldset>
        </div>
      }
      primaryButtonProps={{
        children: 'Create',
        size: 'small',
        disabled: !name.trim(),
        onClick: handleCreate,
      }}
      secondaryButtonProps={{
        children: 'Cancel',
        size: 'small',
        color: 'tertiary',
        variant: 'outlined',
        onClick: onClose,
      }}
    />
  );
};

export default NewSceneDialog;
