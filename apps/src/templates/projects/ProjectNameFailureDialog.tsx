import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import React from 'react';

import i18n from '@cdo/locale';

import BaseDialog from '../BaseDialog';
import DialogFooter from '../teacherDashboard/DialogFooter';

import styles from './project-name-failure-dialog.module.scss';

interface ProjectNameFailureDialogProps {
  flaggedText: string;
  isOpen: boolean;
  handleClose: () => void;
}

const ProjectNameFailureDialog: React.FunctionComponent<
  ProjectNameFailureDialogProps
> = ({flaggedText, isOpen, handleClose}) => {
  return (
    <BaseDialog
      title={i18n.nameFailureDialogTitle()}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <Typography variant="h3" gutterBottom>
        {i18n.nameFailureDialogTitle()}
      </Typography>
      <div className={styles.contents}>
        <p>{i18n.nameFailureDialogBody({text: flaggedText})}</p>
      </div>
      <DialogFooter rightAlign>
        <Button
          text={i18n.ok()}
          onClick={handleClose}
          color={buttonColors.purple}
        />
      </DialogFooter>
    </BaseDialog>
  );
};

export default ProjectNameFailureDialog;
