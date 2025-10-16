import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './dance-view.module.scss';

interface DanceControlsProps {
  onRun: () => void;
  onReset: () => void;
  disabled?: boolean;
}

/**
 * Control buttons for Lab2 Dance Party. Manages flags related to
 * running and loading the program.
 */
const DanceControls: React.FunctionComponent<DanceControlsProps> = ({
  onRun,
  onReset,
  disabled,
}) => {
  const isRunning = useAppSelector(state => state.dance.isRunning);
  const isDisabled =
    useAppSelector(
      state => state.dance.isLoading || state.dance.runIsStarting
    ) || disabled;

  const props = isRunning
    ? {
        text: 'Reset',
        onClick: onReset,
        iconLeft: {iconName: 'rotate-right'},
      }
    : {text: 'Run', onClick: onRun, iconLeft: {iconName: 'play'}};

  return (
    <div className={moduleStyles.controlsContainer}>
      <Button {...props} disabled={isDisabled} />
    </div>
  );
};

export default DanceControls;
