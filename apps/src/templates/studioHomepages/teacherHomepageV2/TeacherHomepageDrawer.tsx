import Button from '@code-dot-org/component-library/button';
import CloseButton from '@code-dot-org/component-library/closeButton';
import {
  BodyTwoText,
  Heading2,
} from '@code-dot-org/component-library/typography';
import Drawer from '@mui/material/Drawer';
import React from 'react';

import i18n from '@cdo/locale';

import styles from './teacherHomepage.module.scss';

interface TeacherHomepageDrawerProps {
  open: boolean;
  onClose: () => void;
  onPrimaryButtonClick: () => void;
  headingText: string;
  description: string;
  hasIcon?: boolean;
  interactiveContent?: React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export const TeacherHomepageDrawer: React.FC<TeacherHomepageDrawerProps> = ({
  open,
  onClose,
  onPrimaryButtonClick,
  headingText,
  description,
  hasIcon,
  interactiveContent,
  primaryButtonText = i18n.save(),
  secondaryButtonText = i18n.cancel(),
}) => {
  return (
    <Drawer
      className={styles.drawer}
      anchor={'bottom'}
      open={open}
      onClose={onClose}
      variant={'persistent'}
    >
      <div className={styles.toolbar}>
        <CloseButton
          aria-label={''}
          onClick={onClose}
          color={'light'}
          size="l"
          className={''}
        />
      </div>
      <Heading2>{headingText}</Heading2>
      <BodyTwoText>{description}</BodyTwoText>
      {interactiveContent && (
        <div className={styles.drawerContent}>{interactiveContent}</div>
      )}
      <div className={styles.drawerFooter}>
        <Button
          type={'secondary'}
          size={'m'}
          color={'gray'}
          text={secondaryButtonText}
          onClick={onClose}
        />

        <Button
          type={'primary'}
          size={'m'}
          text={primaryButtonText}
          onClick={onPrimaryButtonClick}
        />
      </div>
    </Drawer>
  );
};

export default TeacherHomepageDrawer;
