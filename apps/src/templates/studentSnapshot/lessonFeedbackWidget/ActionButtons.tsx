import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import styles from './lessonFeeedback.module.scss';

interface ActionButtonsProps {
  onSaveAsDraft: () => void;
  onSendToStudent: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSaveAsDraft,
  onSendToStudent,
}) => {
  return (
    <div className={styles.actionButtons}>
      <Button
        text={'Save as draft'}
        type="secondary"
        size="xs"
        color="gray"
        onClick={onSaveAsDraft}
      />
      <Button
        text="Send feedback to student"
        size="xs"
        type="primary"
        onClick={onSendToStudent}
      />
    </div>
  );
};

export default ActionButtons;
