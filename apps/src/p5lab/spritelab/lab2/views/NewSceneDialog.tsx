import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';
import TextField from '@code-dot-org/component-library/textField';
import React, {useCallback, useState} from 'react';
import {createPortal} from 'react-dom';

import moduleStyles from './sprite-lab2-view.module.scss';

export const SCENE_NAME_MAX_LENGTH = 40;

interface NewSceneDialogProps {
  onCreate: (name: string) => void;
  onClose: () => void;
}

/** Names a new scene. */
const NewSceneDialog: React.FunctionComponent<NewSceneDialogProps> = ({
  onCreate,
  onClose,
}) => {
  const [name, setName] = useState('');

  const handleCreate = useCallback(() => {
    const trimmed = name.trim();
    if (trimmed) {
      onCreate(trimmed);
    }
    onClose();
  }, [name, onCreate, onClose]);

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
