import {
  faBackward,
  faForward,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
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

/** Base sx shared by all three media-control buttons. */
const MEDIA_CONTROL_SX = {
  cursor: 'pointer',
  margin: '0 20px',
  fontSize: '180%',
  color: 'var(--ocean-color-white)',
  display: 'flex',
  alignItems: 'center',
  background: 'none',
  border: 'none',
  padding: 0,
  '&:hover, &:active': {color: 'var(--ocean-color-orange)'},
} as const;

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

    const selectedColor = 'var(--ocean-color-orange)';

    return (
      <Body>
        {this.state.displayControls && (
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              bottom: '3.5%',
              display: 'flex',
              justifyContent: 'center',
              direction: 'ltr',
            }}
            id="uitest-media-ctrl"
          >
            <ButtonBase
              disableRipple
              aria-label="Rewind"
              onClick={() => this.onScaleTime(true)}
              key={MediaControl.Rewind}
              sx={{
                ...MEDIA_CONTROL_SX,
                color:
                  selectedControl === MediaControl.Rewind
                    ? selectedColor
                    : 'var(--ocean-color-white)',
              }}
            >
              <span
                style={{width: '40px', fontSize: '80%', textAlign: 'center'}}
              >
                {selectedControl === MediaControl.Rewind &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
              <FontAwesomeIcon icon={faBackward} aria-hidden />
            </ButtonBase>
            <ButtonBase
              disableRipple
              aria-label={state.isRunning ? 'Pause' : 'Play'}
              onClick={this.onPressPlay}
              key={MediaControl.Play}
              sx={MEDIA_CONTROL_SX}
            >
              <FontAwesomeIcon
                icon={state.isRunning ? faPause : faPlay}
                aria-hidden
              />
            </ButtonBase>
            <ButtonBase
              disableRipple
              aria-label="Fast forward"
              onClick={() => this.onScaleTime(false)}
              key={MediaControl.FastForward}
              sx={{
                ...MEDIA_CONTROL_SX,
                color:
                  selectedControl === MediaControl.FastForward
                    ? selectedColor
                    : 'var(--ocean-color-white)',
              }}
            >
              <FontAwesomeIcon icon={faForward} aria-hidden />
              <span
                style={{width: '40px', fontSize: '80%', textAlign: 'center'}}
              >
                {selectedControl === MediaControl.FastForward &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
            </ButtonBase>
          </Box>
        )}
        {!state.isRunning && !state.isPaused && (
          <Button
            sx={{
              position: 'absolute',
              bottom: '2%',
              right: '1.2%',
              backgroundColor: 'var(--ocean-color-orange)',
              color: 'var(--ocean-color-white)',
            }}
            onClick={this.onRun}
            id="uitest-run-btn"
          >
            <FontAwesomeIcon icon={faPlay} />
            &nbsp; &nbsp; {I18n.t('run')}
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button
            sx={{
              position: 'absolute',
              bottom: '2%',
              right: '1.2%',
              backgroundColor: 'var(--ocean-color-orange)',
              color: 'var(--ocean-color-white)',
            }}
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
