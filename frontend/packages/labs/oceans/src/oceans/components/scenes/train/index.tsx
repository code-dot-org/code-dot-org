import {faBan, faCheck, faTrash} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Radium from 'radium';
import {Component, type CSSProperties} from 'react';

import {Body, Button} from '@/oceans/components/common';
import {AppMode, Modes} from '@/oceans/constants';
import helpers from '@/oceans/helpers';
import I18n from '@/oceans/i18n';
import modeHelpers from '@/oceans/modeHelpers';
import train from '@/oceans/models/train';
import {getState, setState} from '@/oceans/state';
import styles from '@/oceans/styles';

const aiBotHead = new URL(
  '../../../../assets/images/ai-bot/ai-bot-head.png',
  import.meta.url,
).href;
const aiBotBody = new URL(
  '../../../../assets/images/ai-bot/ai-bot-body.png',
  import.meta.url,
).href;
const counterIcon = new URL(
  '../../../../assets/images/polaroid-icon.png',
  import.meta.url,
).href;

interface TrainLocalState {
  headOpen: boolean;
}

const UnwrappedTrain = class Train extends Component<
  Record<string, never>,
  TrainLocalState
> {
  state: TrainLocalState = {
    headOpen: false,
  };

  render() {
    const state = getState();
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash
        ? I18n.t('yes')
        : (state.word as string);
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash
        ? I18n.t('no')
        : I18n.t('notWord', {word: state.word as string});
    const resetTrainingFunction = () => {
      helpers.resetTraining(state);
      setState({showConfirmationDialog: false});
    };

    return (
      <Body>
        <div style={styles.trainQuestionText}>
          {state.trainingQuestion as string}
        </div>
        <div style={styles.trainBot}>
          <img
            src={aiBotHead}
            style={
              [
                styles.trainBotHead,
                this.state.headOpen && styles.trainBotOpen,
              ] as unknown as CSSProperties
            }
            alt=""
          />
          <img src={aiBotBody} style={styles.trainBotBody} alt="" />
        </div>
        <div style={styles.counter}>
          <img src={counterIcon} style={styles.counterImg} alt="" />
          <span style={styles.counterNum} id="uitest-train-count">
            {Math.min(
              999,
              (state.yesCount as number) + (state.noCount as number),
            )}
          </span>
        </div>
        <div style={styles.eraseButtonContainer}>
          <FontAwesomeIcon
            icon={faTrash}
            style={styles.eraseButton}
            onClick={() => {
              setState({
                showConfirmationDialog: true,
                confirmationDialogOnYes: resetTrainingFunction,
              });
            }}
          />
        </div>
        <div style={styles.trainButtons}>
          <Button
            style={styles.trainButtonNo}
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
            style={styles.trainButtonYes}
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
        </div>
        <Button
          style={styles.continueButton}
          onClick={() => modeHelpers.toMode(Modes.Predicting)}
        >
          {I18n.t('continue')}
        </Button>
      </Body>
    );
  }
};

export default Radium(UnwrappedTrain);
