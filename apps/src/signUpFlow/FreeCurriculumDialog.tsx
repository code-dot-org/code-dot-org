import Button from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import locale from '@cdo/apps/signUpFlow/locale';

import SafeMarkdown from '../templates/SafeMarkdown';

import style from './signUpFlowStyles.module.scss';

interface FreeCurriculumDialogProps {
  isOpen: boolean;
  closeModal: () => void;
}

const FreeCurriculumDialog: React.FunctionComponent<
  FreeCurriculumDialogProps
> = ({isOpen, closeModal}) => {
  const onClose = () => {
    closeModal();
  };

  return isOpen ? (
    <AccessibleDialog
      className={style.dialogContainer}
      onClose={onClose}
      closeOnClickBackdrop={true}
    >
      <Typography component="h1" variant="h3" gutterBottom>
        {locale.our_commitment_to_free_curriculum()}
      </Typography>
      <div className={style.contentWrapper}>
        <SafeMarkdown
          className={style.markdownDesc}
          openExternalLinksInNewTab={true}
          markdown={locale.our_commitment_to_free_resources({
            creativeCommonsLink:
              'https://creativecommons.org/licenses/by-nc-sa/4.0/',
          })}
        />
        <Typography variant="body3" gutterBottom>
          {locale.dedicated_to_expanding()}
        </Typography>
      </div>
      <Button
        onClick={closeModal}
        size={'s'}
        text={locale.return_to_signup()}
      />
    </AccessibleDialog>
  ) : null;
};

export default FreeCurriculumDialog;
