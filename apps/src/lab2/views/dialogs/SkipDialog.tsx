import React from 'react';

import {commonI18n} from '@cdo/apps/types/locale';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type SkipDialogProps = GenericDialogProps & {
  handleConfirm: () => void;
  handleCancel?: () => void;
};

const SkipDialog: React.FunctionComponent<SkipDialogProps> = ({
  handleConfirm,
  handleCancel,
}) => (
  <GenericDialog
    title={commonI18n.skipTitle()}
    message={commonI18n.skipBody()}
    buttons={{
      confirm: {
        callback: handleConfirm,
        text: commonI18n.skipToProject(),
      },
      cancel: {
        callback: handleCancel,
      },
    }}
  />
);

export default SkipDialog;
