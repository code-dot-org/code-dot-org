import {faBan, faCheck, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type {SxProps, Theme} from '@mui/material/styles';
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

    const botHeadSx: SxProps<Theme> = {
      transition: 'transform 500ms',
      left: '3%',
      width: '43%',
      top: '0%',
      position: 'absolute',
      direction: 'ltr',
      ...(this.state.headOpen
        ? {transform: 'rotate(90deg)', transformOrigin: 'bottom right'}
        : {}),
    };

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
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            right: '-2%',
            width: '30%',
            direction: 'ltr',
          }}
        >
          <Box component="img" src={aiBotHead} sx={botHeadSx} alt="" />
          <Box
            component="img"
            src={aiBotBody}
            sx={{width: '49%', marginTop: '30%', direction: 'ltr'}}
            alt=""
          />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '2%',
            right: '7%',
            backgroundColor: 'var(--ocean-color-transparent-black)',
            color: 'var(--ocean-color-neon-blue)',
            borderRadius: '33px',
            textAlign: 'right',
            minWidth: '7%',
            height: '5%',
            padding: '1% 2.5%',
          }}
        >
          <Box
            component="img"
            src={counterIcon}
            sx={{float: 'left', height: '100%'}}
            alt=""
          />
          <span style={{fontSize: '90%'}} id="uitest-train-count">
            {Math.min(999, state.yesCount + state.noCount)}
          </span>
        </Box>
        <ButtonBase
          disableRipple
          aria-label={I18n.t('erase')}
          sx={{
            position: 'absolute',
            top: '2%',
            right: '1.2%',
            cursor: 'pointer',
            borderRadius: '50px',
            padding: '0.75% 1.2%',
            fontSize: '120%',
            backgroundColor: 'var(--ocean-color-white)',
            color: 'var(--ocean-color-grey)',
            height: '6%',
            width: '2.4%',
            border: 'none',
            '&:hover, &:focus': {
              backgroundColor: 'var(--ocean-color-red)',
              color: 'var(--ocean-color-white)',
            },
          }}
          onClick={() => {
            setState({
              showConfirmationDialog: true,
              confirmationDialogOnYes: resetTrainingFunction,
            });
          }}
        >
          <FontAwesomeIcon
            icon={faTrash}
            style={{display: 'block', margin: 'auto', height: '100%'}}
          />
        </ButtonBase>
        <Box
          sx={{
            position: 'absolute',
            top: '83%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Button
            sx={{
              '&:hover': {
                backgroundColor: 'var(--ocean-color-red)',
                color: 'var(--ocean-color-white)',
              },
            }}
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
            sx={{
              marginLeft: '10px',
              '&:hover': {
                backgroundColor: 'var(--ocean-color-green)',
                color: 'var(--ocean-color-white)',
              },
            }}
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
          sx={{
            position: 'absolute',
            bottom: '2%',
            right: '1.2%',
            backgroundColor: 'var(--ocean-color-orange)',
            color: 'var(--ocean-color-white)',
          }}
          onClick={() => modeHelpers.toMode(Modes.Predicting)}
        >
          {I18n.t('continue')}
        </Button>
      </Body>
    );
  }
}

export default Train;
