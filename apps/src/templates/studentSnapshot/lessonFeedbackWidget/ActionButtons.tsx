import {Button as MuiButton} from '@mui/material';
import React from 'react';

import styles from './lessonFeeedback.module.scss';

interface ActionButtonsProps {
  onSaveAsDraft: () => void;
  onSendToStudent: () => void;
  isSaving: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSaveAsDraft,
  onSendToStudent,
  isSaving,
}) => {
  return (
    <div className={styles.actionButtons}>
      <MuiButton
        variant="outlined"
        color="tertiary"
        size="extraSmall"
        disabled={isSaving}
        onClick={onSaveAsDraft}
        type="button"
      >
        {'Save as draft'}
      </MuiButton>
      <MuiButton
        variant="contained"
        color="primary"
        size="extraSmall"
        disabled={isSaving}
        onClick={onSendToStudent}
        type="button"
      >
        {'Send feedback to student'}
      </MuiButton>
    </div>
  );
};

export default ActionButtons;
