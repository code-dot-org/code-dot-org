import Button from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {Heading3} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {COLORS, EMOJIS} from './avatarConstants';
import PickerGrid from './PickerGrid';

import styles from './section-avatars.module.scss';

interface SectionAvatarEditDialogProps {
  closeCallback: () => void;
}

const SectionAvatarEditDialog: React.FC<SectionAvatarEditDialogProps> = ({
  closeCallback,
}) => {
  return (
    <CustomDialog
      className={styles.editorDialog}
      title={i18n.editAvatar()}
      onClose={() => closeCallback()}
    >
      <Heading3>{i18n.editAvatar()}</Heading3>
      <label>
        {i18n.chooseEmoji()}
        <PickerGrid itemList={EMOJIS} type={'emoji'} />
      </label>
      <label>
        {i18n.chooseColor()}
        <PickerGrid itemList={COLORS} type={'color'} />
      </label>
      <Button text={i18n.dialogCancel()} onClick={() => {}} />
      <Button text={i18n.saveAvatar()} onClick={() => {}} />
    </CustomDialog>
  );
};

export default SectionAvatarEditDialog;
