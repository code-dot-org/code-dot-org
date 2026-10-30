import {Typography} from '@mui/material';
import React from 'react';

import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';

import {CodeWidgetLevelInfo} from './types';

import styles from './codeWidget.module.scss';

interface InstructionsPaneProps {
  levelInfo: CodeWidgetLevelInfo;
}

const InstructionsPane: React.FC<InstructionsPaneProps> = ({levelInfo}) => {
  return (
    <div className={styles.instructionsPane}>
      <Typography component="h3" variant="h6">
        Instructions
      </Typography>
      <SafeMarkdown unwrapped markdown={levelInfo.instructions} />
    </div>
  );
};

export default InstructionsPane;
