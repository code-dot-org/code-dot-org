import {Dialog} from '@code-dot-org/component-library/dialog';
import React from 'react';

import i18n from '@cdo/locale';

export interface SectionDeleteDialogProps {
  onCloseCallback: () => void;
  sectionDeleteCallback: () => void;
}

export const SectionDeleteDialog: React.FC<SectionDeleteDialogProps> = ({
  onCloseCallback,
  sectionDeleteCallback,
}) => {
  return (
    <Dialog
      title={i18n.deleteSection()}
      description={i18n.deleteSectionConfirm()}
      onClose={onCloseCallback}
      primaryButtonProps={{
        text: i18n.delete(),
        onClick: sectionDeleteCallback,
      }}
      secondaryButtonProps={{
        text: i18n.dialogCancel(),
        onClick: onCloseCallback,
      }}
    />
  );
};
