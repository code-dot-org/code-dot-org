import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import SparklePulse from '@cdo/apps/aiTutor/views/lessonDeepDive/Animations/SparklePulse';

import styles from './stepPlayer.module.scss';

interface GeneratingProjectProps {
  /** True once the project and instructions are ready for the lab. */
  ready: boolean;
  /** Called once the sparkle comes to rest after `ready`. */
  onSettled: () => void;
}

/** Stands in for the lab while a project step builds the student's project. */
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
