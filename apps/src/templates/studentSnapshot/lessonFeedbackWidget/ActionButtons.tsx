import {Button} from '@code-dot-org/component-library/button';
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
      <Button
        text={'Save as draft'}
        type="secondary"
        size="xs"
        color="gray"
        onClick={onSaveAsDraft}
        disabled={isSaving}
      />
      <Button
        text="Send feedback to student"
        size="xs"
        type="primary"
        onClick={onSendToStudent}
        disabled={isSaving}
      />
    </div>
  );
};

export default ActionButtons;
