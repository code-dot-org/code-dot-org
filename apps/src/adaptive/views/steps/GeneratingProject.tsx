import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import SparklePulse from '@cdo/apps/aiTutor/views/lessonDeepDive/Animations/SparklePulse';

import styles from './stepPlayer.module.scss';

interface GeneratingProjectProps {
  ready: boolean;
  onSettled: () => void;
}

const GeneratingProject: React.FunctionComponent<GeneratingProjectProps> = ({
  ready,
  onSettled,
}) => (
  <div className={styles.generatingProject} role="status">
    <SparklePulse
      size={128}
      phase={ready ? 'ready' : 'thinking'}
      onStopped={onSettled}
    />
    <MuiTypography variant="body2">Building your website...</MuiTypography>
  </div>
);

export default GeneratingProject;
