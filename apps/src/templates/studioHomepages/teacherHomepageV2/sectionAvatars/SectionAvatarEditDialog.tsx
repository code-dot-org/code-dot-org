import Button from '@code-dot-org/component-library/button';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import {
  Heading3,
  BodyTwoText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import i18n from '@cdo/locale';

import {COLORS, EMOJIS} from './avatarConstants';
import PickerGrid from './PickerGrid';
import SectionAvatar from './SectionAvatar';

import styles from './section-avatars.module.scss';

interface SectionAvatarEditDialogProps {
  closeCallback: () => void;
  avatarColor: number;
  avatarEmoji: number;
}

const SectionAvatarEditDialog: React.FC<SectionAvatarEditDialogProps> = ({
  closeCallback,
  avatarColor,
  avatarEmoji,
}) => {
  return (
    <CustomDialog
      className={styles.editorDialog}
      title={i18n.editAvatar()}
      onClose={() => closeCallback()}
    >
      <div className={styles.avatarDialogHeader}>
        <Heading3>{i18n.editAvatar()}</Heading3>
        <hr />
      </div>
      <div className={styles.avatarDialogBody}>
        <label className={styles.avatarDialogLabels}>
          <BodyTwoText>{i18n.avatar()}</BodyTwoText>
          <SectionAvatar
            color={avatarColor || 0}
            emoji={avatarEmoji || 0}
            size={'l'}
          />
        </label>
        <div className={styles.avatarDialogBodyRight}>
          <label className={styles.avatarDialogLabels}>
            <BodyTwoText>{i18n.chooseEmoji()}</BodyTwoText>
            <PickerGrid itemList={EMOJIS} type={'emoji'} />
          </label>
          <label className={styles.avatarDialogLabels}>
            <BodyTwoText>{i18n.chooseColor()}</BodyTwoText>
            <PickerGrid itemList={COLORS} type={'color'} />
          </label>
        </div>
      </div>
      <hr />
      <div className={styles.avatarDialogFooter}>
        <Button
          text={i18n.dialogCancel()}
          onClick={() => {}}
          color={'gray'}
          size={'s'}
          type={'secondary'}
        />
        <Button
          text={i18n.selectAvatar()}
          onClick={() => {}}
          size={'s'}
          type={'primary'}
        />
      </div>
    </CustomDialog>
  );
};

export default SectionAvatarEditDialog;
