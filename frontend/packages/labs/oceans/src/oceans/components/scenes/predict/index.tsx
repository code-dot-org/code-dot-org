import {
  faBackward,
  faForward,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import * as React from 'react';

import {Body, Button} from '@/oceans/components/common';
import constants, {AppMode, Modes} from '@/oceans/constants';
import {$time, currentRunTime, finishMovement} from '@/oceans/helpers';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import {getState, setState} from '@/oceans/state';

const defaultTimeScale = 1;
const timeScales = [1, 2];
const MediaControl = Object.freeze({
  Rewind: 'rewind',
  Play: 'play',
  FastForward: 'fast-forward',
});

interface PredictState {
  displayControls: boolean;
  timeScale: number;
}

class Predict extends React.Component<Record<string, never>, PredictState> {
  state: PredictState = {
    displayControls: false,
    timeScale: defaultTimeScale,
  };

  onRun = () => {
    const state = setState({isRunning: true, runStartTime: $time()});
    if (state.appMode !== AppMode.CreaturesVTrashDemo) {
      this.setState({displayControls: true});
    }
  };

  onContinue = () => {
    const state = getState();
    if (state.appMode === AppMode.CreaturesVTrashDemo && state.onContinue) {
      state.onContinue();
    } else {
      setState({showRecallFish: false});
      modeHelpers.toMode(Modes.Pond);
    }
  };

  finishMovement = () => {
    const state = getState();

    const t = currentRunTime(state);
    if (state.rewind) {
      finishMovement(state.lastPauseTime - t);
    } else {
      finishMovement(state.lastPauseTime + t);
    }
  };

  onPressPlay = () => {
    const state = getState();
    this.finishMovement();
    setState({
      isRunning: !state.isRunning,
      isPaused: !state.isPaused,
      rewind: false,
      moveTime: constants.defaultMoveTime / defaultTimeScale,
    });
    this.setState({timeScale: defaultTimeScale});
  };

  onScaleTime = (rewind: boolean) => {
    this.finishMovement();
    const nextIdx = timeScales.indexOf(this.state.timeScale) + 1;
    const timeScale =
      nextIdx > timeScales.length - 1 ? timeScales[0] : timeScales[nextIdx];

    setState({
      rewind,
      isRunning: true,
      isPaused: false,
      moveTime: constants.defaultMoveTime / timeScale,
    });
    this.setState({timeScale});
  };

  render() {
    const state = getState();
    let selectedControl;
    if (state.isRunning && state.rewind) {
      selectedControl = MediaControl.Rewind;
    } else if (
      state.isRunning &&
      !state.rewind &&
      this.state.timeScale !== defaultTimeScale
    ) {
      selectedControl = MediaControl.FastForward;
    }

    const rewindClassName =
      selectedControl === MediaControl.Rewind
        ? 'ocean-media-control ocean-media-control--selected'
        : 'ocean-media-control';
    const fastForwardClassName =
      selectedControl === MediaControl.FastForward
        ? 'ocean-media-control ocean-media-control--selected'
        : 'ocean-media-control';

    return (
      <Body>
        {this.state.displayControls && (
          <Box className="ocean-media-controls" id="uitest-media-ctrl">
            <Box
              component="button"
              type="button"
              aria-label="Rewind"
              onClick={() => this.onScaleTime(true)}
              className={rewindClassName}
              key={MediaControl.Rewind}
            >
              <span className="ocean-media-control__time-scale">
                {selectedControl === MediaControl.Rewind &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
              <FontAwesomeIcon icon={faBackward} aria-hidden />
            </Box>
            <Box
              component="button"
              type="button"
              aria-label={state.isRunning ? 'Pause' : 'Play'}
              onClick={this.onPressPlay}
              className="ocean-media-control"
              key={MediaControl.Play}
            >
              <FontAwesomeIcon
                icon={state.isRunning ? faPause : faPlay}
                aria-hidden
              />
            </Box>
            <Box
              component="button"
              type="button"
              aria-label="Fast forward"
              onClick={() => this.onScaleTime(false)}
              className={fastForwardClassName}
              key={MediaControl.FastForward}
            >
              <FontAwesomeIcon icon={faForward} aria-hidden />
              <span className="ocean-media-control__time-scale">
                {selectedControl === MediaControl.FastForward &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
            </Box>
          </Box>
        )}
        {!state.isRunning && !state.isPaused && (
          <Button
            className="ocean-button--continue"
            onClick={this.onRun}
            id="uitest-run-btn"
          >
            <FontAwesomeIcon icon={faPlay} />
            &nbsp; &nbsp; {I18n.t('run')}
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button
            className="ocean-button--continue"
            onClick={this.onContinue}
            id="uitest-continue-btn"
          >
            {I18n.t('continue')}
          </Button>
        )}
      </Body>
    );
  }
}
export default Predict;
