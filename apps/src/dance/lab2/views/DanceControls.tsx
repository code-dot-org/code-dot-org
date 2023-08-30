import React, {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {DanceSongState, queueRun, setIsRunning} from '../../redux';
import {ResetButton, RunButton} from './ControlButtons';
import moduleStyles from './dance-controls.module.scss';

interface DanceControlsProps {
  onRun: () => void;
  onReset: () => void;
}

const DanceControls: React.FunctionComponent<DanceControlsProps> = ({
  onRun,
  onReset,
}) => {
  const dispatch = useDispatch();
  const isRunning = useSelector(
    (state: {songs: DanceSongState}) => state.songs.isRunning
  );
  const isLoading = useSelector(
    (state: {songs: DanceSongState}) => state.songs.isLoading
  );
  const runQueued = useSelector(
    (state: {songs: DanceSongState}) => state.songs.runQueued
  );

  const runCallback = useCallback(() => {
    dispatch(setIsRunning(true));
    onRun();
  }, [dispatch, onRun]);

  const onClickRun = useCallback(() => {
    if (isRunning || runQueued) {
      return;
    }

    if (isLoading) {
      dispatch(queueRun());
      return;
    }

    runCallback();
  }, [dispatch, isRunning, isLoading, runQueued, runCallback]);

  const onClickReset = useCallback(() => {
    if (!isRunning || runQueued) {
      return;
    }

    onReset();
    dispatch(setIsRunning(false));
  }, [dispatch, isRunning, runQueued, onReset]);

  useEffect(() => {
    if (runQueued && !isLoading) {
      runCallback();
    }
  }, [runQueued, isLoading, onRun, dispatch, runCallback]);

  return (
    <div className={moduleStyles.controlsContainer}>
      {isRunning ? (
        <ResetButton text="Reset" onClick={onClickReset} disabled={runQueued} />
      ) : (
        <RunButton text="Run" onClick={onClickRun} disabled={runQueued} />
      )}
    </div>
  );
};

export default DanceControls;
