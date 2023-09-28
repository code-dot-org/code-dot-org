import {
  ResetButton,
  RunButton,
} from '@cdo/apps/lab2/views/components/ControlButtons';
import React, {useCallback, useEffect} from 'react';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {DanceState, queueRun} from '../../danceRedux';
import moduleStyles from './dance-controls.module.scss';

interface DanceControlsProps {
  onRun: () => void;
  onReset: () => void;
}

const useTypedSelector: TypedUseSelectorHook<{
  dance: DanceState;
}> = useSelector;

/**
 * Control buttons for Lab2 Dance Party. Manages flags related to
 * running and loading the program.
 */
const DanceControls: React.FunctionComponent<DanceControlsProps> = ({
  onRun,
  onReset,
}) => {
  const dispatch = useDispatch();
  const isRunning = useTypedSelector(state => state.dance.isRunning);
  const isLoading = useTypedSelector(state => state.dance.isLoading);
  const runQueued = useTypedSelector(state => state.dance.runQueued);
  const runIsStarting = useTypedSelector(state => state.dance.runIsStarting);

  // Handle run button click
  const onClickRun = useCallback(() => {
    // If a run in progress, about to start, or queued, do nothing.
    if (isRunning || runIsStarting || runQueued) {
      return;
    }

    // If the run button was clicked while loading, queue the run
    // to start as soon as the load is finished.
    if (isLoading) {
      dispatch(queueRun());
      return;
    }

    onRun();
  }, [dispatch, isRunning, runIsStarting, isLoading, runQueued, onRun]);

  // Handle reset button click
  const onClickReset = useCallback(() => {
    // If there's no run in progress, or it's about to start or is queued, do nothing.
    if (!isRunning || runIsStarting || runQueued) {
      return;
    }

    onReset();
  }, [isRunning, runIsStarting, runQueued, onReset]);

  useEffect(() => {
    // If a run was queued and we've finished loading, run the program.
    if (runQueued && !isLoading) {
      onRun();
    }
  }, [runQueued, isLoading, onRun]);

  return (
    <div className={moduleStyles.controlsContainer}>
      {isRunning ? (
        <ResetButton
          text="Reset"
          onClick={onClickReset}
          disabled={runQueued || runIsStarting}
        />
      ) : (
        <RunButton
          text="Run"
          onClick={onClickRun}
          disabled={runQueued || runIsStarting}
        />
      )}
    </div>
  );
};

export default DanceControls;
