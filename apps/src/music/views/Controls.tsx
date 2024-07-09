import React, {useCallback} from 'react';
import classNames from 'classnames';
import {Triggers} from '@cdo/apps/music/constants';
import moduleStyles from './controls.module.scss';
import BeatPad from './BeatPad';
import {useDispatch} from 'react-redux';
import {
  moveStartPlayheadPositionBackward,
  moveStartPlayheadPositionForward,
} from '../redux/musicRedux';
import {useMusicSelector} from './types';
import {commonI18n} from '@cdo/apps/types/locale';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants.js';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

const LoadingProgress: React.FunctionComponent = () => {
  const progressValue = useMusicSelector(
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
  const isPlaying = useMusicSelector(state => state.music.isPlaying);
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
  hasTrigger: (id: string) => boolean;
  enableSkipControls?: boolean;
}

/**
 * Renders the playback controls bar, including the play/pause button, show/hide beat pad button,
 * and show/hide instructions button.
 */
const Controls: React.FunctionComponent<ControlsProps> = ({
  setPlaying,
  playTrigger,
  hasTrigger,
  enableSkipControls = false,
}) => {
  const isPlaying = useMusicSelector(state => state.music.isPlaying);
  const isLoading = useMusicSelector(
    state => state.music.soundLoadingProgress < 1
  );

  // Sends a Statsig event when the Run button is pressed when a user is signed out
  const sendAnalyticsEvent = (): void => {
    const isSignedOut: boolean =
      document.querySelector('script[data-issignedout="true"]') !== null;

    if (isSignedOut && !isPlaying) {
      analyticsReporter.sendEvent(
        EVENTS.RUN_BUTTON_PRESSED_SIGNED_OUT,
        {},
        PLATFORMS.STATSIG
      );
    }
  };

  return (
    <div id="controls" className={moduleStyles.controlsContainer}>
      <div id="controls-section" className={moduleStyles.section}>
        <button
          id="run-button"
          className={classNames(
            moduleStyles.runButton,
            isLoading && moduleStyles.disabled
          )}
          onClick={() => {
            setPlaying(!isPlaying);
            sendAnalyticsEvent();
          }}
          type="button"
          disabled={isLoading}
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
      <BeatPad
        triggers={Triggers.filter(trigger => hasTrigger(trigger.id))}
        playTrigger={playTrigger}
      />
      <LoadingProgress />
    </div>
  );
};

export default Controls;
