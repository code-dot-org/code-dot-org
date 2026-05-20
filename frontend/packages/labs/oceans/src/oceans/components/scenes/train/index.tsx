import {faBan, faCheck, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import * as React from 'react';

import aiBotBody from '@/assets/images/ai-bot/ai-bot-body.png';
import aiBotHead from '@/assets/images/ai-bot/ai-bot-head.png';
import counterIcon from '@/assets/images/polaroid-icon.png';
import {Body, Button} from '@/oceans/components/common';
import {AppMode, Modes} from '@/oceans/constants';
import helpers from '@/oceans/helpers';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import train from '@/oceans/models/train';
import {getState, setState} from '@/oceans/state';

interface TrainState {
  headOpen: boolean;
}

class Train extends React.Component<Record<string, never>, TrainState> {
  state: TrainState = {
    headOpen: false,
  };

  render() {
    const state = getState();
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? I18n.t('yes') : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash
        ? I18n.t('no')
        : I18n.t('notWord', {word: state.word});
    const resetTrainingFunction = () => {
      helpers.resetTraining(state);
      setState({showConfirmationDialog: false});
    };

    const botHeadClassName = this.state.headOpen
      ? 'ocean-train__bot-head ocean-train__bot-head--open'
      : 'ocean-train__bot-head';

    return (
      <Body>
        <Box
          sx={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '180%',
            color: 'var(--ocean-color-white)',
            whiteSpace: 'nowrap',
          }}
        >
          {state.trainingQuestion}
        </Box>
        <Box className="ocean-train__bot">
          <img src={aiBotHead} className={botHeadClassName} alt="" />
          <img src={aiBotBody} className="ocean-train__bot-body" alt="" />
        </Box>
        <Box className="ocean-counter">
          <img src={counterIcon} className="ocean-counter__img" alt="" />
          <span className="ocean-counter__num" id="uitest-train-count">
            {Math.min(999, state.yesCount + state.noCount)}
          </span>
        </Box>
        <Box
          component="button"
          type="button"
          className="ocean-erase-button"
          aria-label={I18n.t('erase')}
          onClick={() => {
            setState({
              showConfirmationDialog: true,
              confirmationDialogOnYes: resetTrainingFunction,
            });
          }}
        >
          <FontAwesomeIcon
            icon={faTrash}
            className="ocean-erase-button__icon"
          />
        </Box>
        <Box className="ocean-train__buttons">
          <Button
            className="ocean-train__button-no"
            onClick={() => {
              this.setState({headOpen: true});
              return train.onClassifyFish(false);
            }}
            sound={'no'}
          >
            <FontAwesomeIcon icon={faBan} />
            &nbsp; &nbsp;
            {noButtonText}
          </Button>
          <Button
            className="ocean-train__button-yes"
            onClick={() => {
              this.setState({headOpen: true});
              return train.onClassifyFish(true);
            }}
            sound={'yes'}
          >
            <FontAwesomeIcon icon={faCheck} />
            &nbsp; &nbsp;
            {yesButtonText}
          </Button>
        </Box>
        <Button
          className="ocean-button--continue"
          onClick={() => modeHelpers.toMode(Modes.Predicting)}
        >
          {I18n.t('continue')}
        </Button>
      </Body>
    );
  }
}

export default Train;
