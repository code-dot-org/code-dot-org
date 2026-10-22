import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';
import {createPortal} from 'react-dom';

import platformerPicture from '@cdo/static/spritelab_lab2/scene-types/platformer.png';
import storyPicture from '@cdo/static/spritelab_lab2/scene-types/story.png';

import {SceneType} from '../types';

import moduleStyles from './sprite-lab2-view.module.scss';

export const SCENE_NAME_MAX_LENGTH = 40;

// What each scene type is called for a student choosing one, with a
// picture of the kind of scene it makes.
const SCENE_TYPES: {value: SceneType; label: string; picture: string}[] = [
  {value: 'story', label: 'A story', picture: storyPicture},
  {value: 'platform', label: 'A platformer', picture: platformerPicture},
];

interface NewSceneDialogProps {
  onCreate: (name: string, type: SceneType) => void;
  onClose: () => void;
}

/**
 * Picks a new scene's type and names it. A scene's type decides the blocks
 * it offers and how big its sprites are, so it is chosen once, here, rather
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

  // Mounted at the lab's theme root, outside any stacked bar that would
  // otherwise cap the overlay below the playspace, and inside the theme's
  // variables, which a portal to the body would leave behind.
  const [host, setHost] = useState<Element | null>(null);
  const anchorRef = useCallback(
    (anchor: HTMLElement | null) =>
      setHost(anchor?.closest('[data-theme]') ?? document.body),
    []
  );
  const dialog = (
    <Dialog
      title="New scene"
      onClose={onClose}
      customContent={
        <div className={moduleStyles.newSceneFields}>
          <fieldset className={moduleStyles.sceneTypeGroup}>
            <legend>What is this scene for?</legend>
            <div className={moduleStyles.sceneTypeCards}>
              {SCENE_TYPES.map(({value, label, picture}) => (
                <label
                  key={value}
                  className={classNames(
                    moduleStyles.sceneTypeCard,
                    type === value && moduleStyles.sceneTypeCardChosen
                  )}
                >
                  <input
                    type="radio"
                    name="sceneType"
                    value={value}
                    className={moduleStyles.sceneTypeInput}
                    checked={type === value}
                    onChange={() => setType(value)}
                  />
                  <img src={picture} alt="" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <TextField
            name="sceneName"
            label="Scene name"
            value={name}
            maxLength={SCENE_NAME_MAX_LENGTH}
            onChange={e => setName(e.target.value)}
          />
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
  return (
    <>
      <span ref={anchorRef} hidden />
      {host && createPortal(dialog, host)}
    </>
  );
};

export default NewSceneDialog;
