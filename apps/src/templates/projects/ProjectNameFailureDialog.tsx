import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
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
      <Heading3>{i18n.nameFailureDialogTitle()}</Heading3>
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
