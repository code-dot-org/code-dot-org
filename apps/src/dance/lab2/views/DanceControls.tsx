import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {useRunButtonColorOverride} from '@cdo/apps/blockly/utils/setupBlockColor';
import {getRunButtonSx} from '@cdo/apps/templates/runButtonSx';
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
  // Mirrors the setup ("when run") block color under accessibility themes.
  const colorOverride = useRunButtonColorOverride();

  return (
    <div className={moduleStyles.controlsContainer}>
      <MuiButton
        variant="contained"
        color="primary"
        size="medium"
        disabled={isDisabled}
        className={moduleStyles.controlButton}
        onClick={isRunning ? onReset : onRun}
        type="button"
        // Run is orange; the same button as Reset (while running) keeps the
        // standard primary style, matching Reset in every other lab.
        sx={isRunning ? undefined : getRunButtonSx(colorOverride)}
        startIcon={
          <FontAwesomeV6Icon iconName={isRunning ? 'rotate-right' : 'play'} />
        }
      >
        {isRunning ? 'Reset' : 'Run'}
      </MuiButton>
    </div>
  );
};

export default DanceControls;
