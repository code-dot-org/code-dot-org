import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './dance-view.module.scss';

interface DanceControlsProps {
  onRun: () => void;
  onReset: () => void;
}

/**
 * Control buttons for Lab2 Dance Party. Manages flags related to
 * running and loading the program.
 */
const DanceControls: React.FunctionComponent<DanceControlsProps> = ({
  onRun,
  onReset,
}) => {
  const isRunning = useAppSelector(state => state.dance.isRunning);
  const disabled = useAppSelector(
    state => state.dance.isLoading || state.dance.runIsStarting
  );

  const props = isRunning
    ? {
        text: 'Reset',
        onClick: onReset,
        iconLeft: {iconName: 'rotate-right'},
      }
    : {text: 'Run', onClick: onRun, iconLeft: {iconName: 'play'}};

  return (
    <div className={moduleStyles.controlsContainer}>
      <Button {...props} disabled={disabled} />
    </div>
  );
};

export default DanceControls;
