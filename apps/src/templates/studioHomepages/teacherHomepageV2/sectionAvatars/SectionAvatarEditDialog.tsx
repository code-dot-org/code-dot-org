import Button from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  Heading3,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
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

  const handleSelectColor = (index: number) => {
    setSelectedColor(index);
  };

  const handleSelectEmoji = (index: number) => {
    setSelectedEmoji(index);
  };

  return (
    <CustomDialog
      aria-label="Section avatar edit dialog"
      className={styles.editorDialog}
      title={i18n.editAvatar()}
      onClose={() => closeCallback()}
    >
      <div
        className={styles.accessibleDescription}
        id="dsco-dialog-description"
      >
        {i18n.avatarEditDialogDescription()}
      </div>
      <div className={styles.avatarDialogHeader}>
        <Heading3>{i18n.editAvatar()}</Heading3>
        <hr />
      </div>
      <div className={styles.avatarDialogBody}>
        <label className={styles.avatarDialogLabels}>
          <BodyTwoText>{i18n.avatar()}</BodyTwoText>
          <SectionAvatar
            color={selectedColor}
            emoji={selectedEmoji}
            size={'xl'}
          />
        </label>
        <div className={styles.avatarDialogBodyRight}>
          <label className={styles.avatarDialogLabels}>
            <BodyTwoText>{i18n.chooseEmoji()}</BodyTwoText>
            <PickerGrid
              type={'emoji'}
              selectCallback={handleSelectEmoji}
              selected={selectedEmoji}
            />
          </label>
          <label className={styles.avatarDialogLabels}>
            <BodyTwoText>{i18n.chooseColor()}</BodyTwoText>
            <PickerGrid
              type={'color'}
              selectCallback={handleSelectColor}
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
