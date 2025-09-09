import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';

import {submitPredictResponse} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {Trigger} from '@cdo/apps/music/constants';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  moveStartPlayheadPositionBackward,
  moveStartPlayheadPositionForward,
} from '../redux/musicRedux';

import BeatPad from './BeatPad';

import moduleStyles from './controls.module.scss';

const LoadingProgress: React.FunctionComponent = () => {
  const progressValue = useAppSelector(
    state => state.music.soundLoadingProgress
  );

  return (
    <div
      id="loading-progress"
      className={classNames(
        moduleStyles.loadingProgress,
        progressValue >= 1 && moduleStyles.loadingProgressHide
      )}
    >
      <div
        className={classNames(
          moduleStyles.loadingProgressFill,
          progressValue === 0 && moduleStyles.loadingProgressFillZero
        )}
        style={{
          width: `${progressValue * 100}%`,
        }}
      >
        &nbsp;
      </div>
    </div>
  );
};

const SkipControls: React.FunctionComponent = () => {
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const dispatch = useDispatch();

  const onClickSkip = useCallback(
    (forward: boolean) => {
      if (isPlaying) {
        return;
      }

      if (forward) {
        dispatch(moveStartPlayheadPositionForward());
      } else {
        dispatch(moveStartPlayheadPositionBackward());
      }
    },
    [dispatch, isPlaying]
  );

  return (
    <>
      <button
        id="skip-back-button"
        className={classNames(
          moduleStyles.skipButton,
          isPlaying && moduleStyles.disabled
        )}
        onClick={() => onClickSkip(false)}
        type="button"
      >
        <FontAwesomeV6Icon
          iconName={'step-backward'}
          iconStyle="solid"
          className={moduleStyles.icon}
        />
      </button>
      <button
        id="skip-forward-button"
        className={classNames(
          moduleStyles.skipButton,
          isPlaying && moduleStyles.disabled
        )}
        onClick={() => onClickSkip(true)}
        type="button"
      >
        <FontAwesomeV6Icon
          iconName={'step-forward'}
          iconStyle="solid"
          className={moduleStyles.icon}
        />
      </button>
    </>
  );
};

interface ControlsProps {
  setPlaying: (value: boolean) => void;
  playTrigger: (id: string) => void;
  triggers: Trigger[];
  isPredictLevel?: boolean;
  enableSkipControls?: boolean;
}

/**
 * Renders the playback controls bar, including the play/pause button, show/hide beat pad button,
 * and show/hide instructions button.
 */
const Controls: React.FunctionComponent<ControlsProps> = ({
  setPlaying,
  playTrigger,
  triggers,
  isPredictLevel,
  enableSkipControls = false,
}) => {
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const disableRun = useAppSelector(({predictLevel, music}) => {
    const hasPredictResponse = !!predictLevel.response;
    const isLoading = music.soundLoadingProgress < 1;
    return isLoading || (isPredictLevel && !hasPredictResponse);
  });
  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      <div id="controls-section" className={moduleStyles.section}>
        <button
          id="run-button"
          className={classNames(
            moduleStyles.runButton,
            disableRun && moduleStyles.disabled
          )}
          onClick={() => {
            dispatch(submitPredictResponse({appType: 'music'}));
            setPlaying(!isPlaying);
          }}
          type="button"
          disabled={disableRun}
        >
          <FontAwesomeV6Icon
            iconName={isPlaying ? 'stop' : 'play'}
            iconStyle="solid"
            className={moduleStyles.icon}
          />
          <div className={moduleStyles.text}>
            {isPlaying ? commonI18n.stop() : commonI18n.runProgram()}
          </div>
        </button>
        {enableSkipControls && <SkipControls />}
      </div>
      <BeatPad triggers={triggers} playTrigger={playTrigger} />
      <LoadingProgress />
    </div>
  );
};

export default memo(Controls);
