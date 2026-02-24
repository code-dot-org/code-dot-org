import React from 'react';
import IdleTimer from 'react-idle-timer';

import Lab2ProgressTimer from '@cdo/apps/lab2/utils/Lab2ProgressTimer';

const IDLE_AFTER_MS = 1000 * 60 * 2; // 2 minutes

const Lab2IdleTimer: React.FC = () => {
  const timer = Lab2ProgressTimer.getInstance();
  timer.resetMilestoneTimer();

  return (
    <IdleTimer
      timeout={IDLE_AFTER_MS}
      onIdle={() => timer.startIdle()}
      onActive={() => timer.endIdle()}
    />
  );
};

export default Lab2IdleTimer;
