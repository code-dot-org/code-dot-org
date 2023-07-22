import PropTypes from 'prop-types';
import React, {useEffect, useContext, useCallback} from 'react';
import classNames from 'classnames';
import FontAwesome from '../../templates/FontAwesome';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {AnalyticsContext} from '../context';
import {useDispatch, useSelector} from 'react-redux';
import {
  hideBeatPad,
  moveStartPlayheadPositionBackward,
  moveStartPlayheadPositionForward,
  showBeatPad,
} from '../redux/musicRedux';
import commonI18n from '@cdo/locale';
import musicI18n from '../locale';

const LoadingProgress = () => {
  const progressValue = useSelector(state => state.music.soundLoadingProgress);

  if (progressValue >= 1) {
    return null;
  }

  return (
    <div id="loading-progress" className={moduleStyles.loadingProgress}>
      <div
        className={moduleStyles.loadingProgressFill}
        style={{
          width: `${progressValue * 100}%`,
        }}
      >
        &nbsp;
      </div>
    </div>
  );
};

const SkipControls = () => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const dispatch = useDispatch();

  const onClickSkip = useCallback(
    forward => {
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
          moduleStyles.controlButton,
          moduleStyles.controlButtonSkip,
          isPlaying && moduleStyles.controlButtonSkipDisabled
        )}
        onClick={() => onClickSkip(false)}
        type="button"
      >
        <FontAwesome icon={'step-backward'} />
      </button>
      <button
        id="skip-forward-button"
        className={classNames(
          moduleStyles.controlButton,
          moduleStyles.controlButtonSkip,
          isPlaying && moduleStyles.controlButtonSkipDisabled
        )}
        onClick={() => onClickSkip(true)}
        type="button"
      >
        <FontAwesome icon={'step-forward'} />
      </button>
    </>
  );
};

/**
 * Renders the playback controls bar, including the play/pause button, show/hide beat pad button,
 * and show/hide instructions button.
 */
const Controls = ({
  setPlaying,
  playTrigger,
  hasTrigger,
  enableSkipControls = false,
  onNextPanel,
  currentLevelIndex,
  levelCount,
}) => {
  const isPlaying = useSelector(state => state.music.isPlaying);
  const isBeatPadShowing = useSelector(state => state.music.isBeatPadShowing);
  const validationState = useSelector(state => state.lab.validationState);
  const dispatch = useDispatch();

  const currentPanel = currentLevelIndex;

  const getNextPanel = () => {
    return currentPanel + 1 < levelCount ? currentPanel + 1 : null;
  };

  const hasNextPanel = validationState.satisfied ? !!getNextPanel() : false;

  useEffect(() => {
    if (isPlaying) {
      dispatch(showBeatPad());
    }
  }, [dispatch, isPlaying]);

  const analyticsReporter = useContext(AnalyticsContext);

  const renderBeatPad = () => {
    return (
      <BeatPad
        triggers={Triggers}
        playTrigger={playTrigger}
        onClose={() => {
          dispatch(hideBeatPad());
          analyticsReporter.onButtonClicked('show-hide-beatpad', {
            showing: false,
          });
        }}
        hasTrigger={hasTrigger}
        isPlaying={isPlaying}
      />
    );
  };

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      <div id="controls-section" className={moduleStyles.section}>
        <button
          id="run-button"
          className={classNames(
            moduleStyles.controlButton,
            moduleStyles.controlButtonRun
          )}
          onClick={() => setPlaying(!isPlaying)}
          type="button"
        >
          <FontAwesome icon={isPlaying ? 'stop' : 'play'} />
          <div className={moduleStyles.text}>
            {isPlaying ? commonI18n.stop() : commonI18n.runProgram()}
          </div>
        </button>

        <button
          id="instructions-feedback-button"
          type="button"
          onClick={() => onNextPanel()}
          className={classNames(
            moduleStyles.buttonNext,
            !hasNextPanel && moduleStyles.buttonNextDisabled
          )}
        >
          {musicI18n.continue()}
        </button>

        {enableSkipControls && <SkipControls />}
      </div>
      {isBeatPadShowing && renderBeatPad()}
      <LoadingProgress />
    </div>
  );
};

Controls.propTypes = {
  setPlaying: PropTypes.func.isRequired,
  playTrigger: PropTypes.func.isRequired,
  hasTrigger: PropTypes.func.isRequired,
  enableSkipControls: PropTypes.bool,
  onNextPanel: PropTypes.func,
  currentLevelIndex: PropTypes.number,
  levelCount: PropTypes.number,
};

export default Controls;
