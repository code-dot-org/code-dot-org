import Button from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import PickerGrid from './PickerGrid';
import SectionAvatar from './SectionAvatar';

import styles from './section-avatars.module.scss';

interface SectionAvatarEditDialogProps {
  closeCallback: () => void;
  saveCallback: (selectedColor: number, selectedEmoji: number) => void;
  avatarColor: number;
  avatarEmoji: number;
}

const SectionAvatarEditDialog: React.FC<SectionAvatarEditDialogProps> = ({
  closeCallback,
  saveCallback,
  avatarColor,
  avatarEmoji,
}) => {
  const [selectedColor, setSelectedColor] = React.useState<number>(
    avatarColor || 0
  );
  const [selectedEmoji, setSelectedEmoji] = React.useState<number>(
    avatarEmoji || 0
  );

  return (
    <CustomDialog
      aria-label="Section avatar edit dialog"
      className={styles.editorDialog}
      title={i18n.editAvatar()}
      onClose={() => closeCallback()}
    >
      {/* This div is interactive to prevent autofocus in the 
      PickerGrid component and to allow screen readers to replay 
      the dialog description. It is not visible. */}
      <div
        className={styles.accessibleDescription}
        id="dsco-dialog-description"
        role="button"
        tabIndex={0}
        onClick={() => {}}
      >
        {i18n.avatarEditDialogDescription()}
      </div>
      <div className={styles.avatarDialogHeader}>
        <Typography variant="h3" gutterBottom>
          {i18n.editAvatar()}
        </Typography>
        <hr />
      </div>
      <div className={styles.avatarDialogBody}>
        <label className={styles.avatarDialogLabels}>
          <Typography variant="body2" gutterBottom>
            {i18n.avatar()}
          </Typography>
          <SectionAvatar
            color={selectedColor}
            emoji={selectedEmoji}
            size={'l'}
          />
        </label>
        <div className={styles.avatarDialogBodyRight}>
          <label className={styles.avatarDialogLabels}>
            <Typography variant="body2" gutterBottom>
              {i18n.chooseEmoji()}
            </Typography>
            <PickerGrid
              type={'emoji'}
              selectCallback={setSelectedEmoji}
              selected={selectedEmoji}
            />
          </label>
          <label className={styles.avatarDialogLabels}>
            <Typography variant="body2" gutterBottom>
              {i18n.chooseColor()}
            </Typography>
            <PickerGrid
              type={'color'}
              selectCallback={setSelectedColor}
              selected={selectedColor}
            />
          </label>
        </div>
      </div>
      <hr />
      <div className={styles.avatarDialogFooter}>
        <Button
          text={i18n.dialogCancel()}
          onClick={() => closeCallback()}
          color={'gray'}
          size={'s'}
          type={'secondary'}
        />
        <Button
          text={i18n.selectAvatar()}
          onClick={() => saveCallback(selectedColor, selectedEmoji)}
          size={'s'}
          type={'primary'}
        />
      </div>
    </CustomDialog>
  );
};

export default SectionAvatarEditDialog;
