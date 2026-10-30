import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './codeWidget.module.scss';

interface InstructionsTabProps {
  isActive: boolean;
  onClick: () => void;
}

const InstructionsTab: React.FC<InstructionsTabProps> = ({
  isActive,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${styles.fileTab} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.label}>
        <FontAwesomeV6Icon iconName="book" />
        <Typography component="p" variant="body4">
          Instructions
        </Typography>
      </div>
    </div>
  );
};

export default InstructionsTab;
