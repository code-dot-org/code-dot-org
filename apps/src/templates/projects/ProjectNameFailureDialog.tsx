import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

import i18n from '@cdo/locale';

interface ProjectNameFailureDialogProps {
  flaggedText: string;
  isOpen: boolean;
  handleClose: () => void;
}

const ProjectNameFailureDialog: React.FunctionComponent<
  ProjectNameFailureDialogProps
> = ({flaggedText, isOpen, handleClose}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      onClose={handleClose}
      title={i18n.nameFailureDialogTitle()}
      description={i18n.nameFailureDialogBody({text: flaggedText})}
      primaryButtonProps={{
        onClick: handleClose,
        children: i18n.ok(),
        size: 'medium',
        type: 'button',
      }}
    />
  );
};

export default ProjectNameFailureDialog;
