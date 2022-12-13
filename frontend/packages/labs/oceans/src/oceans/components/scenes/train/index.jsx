import React from 'react'
import Radium from "radium";

import {getState, setState} from "@ml/oceans/state";
import {AppMode, Modes} from "@ml/oceans/constants";
import I18n from "@ml/oceans/i18n";
import helpers from "@ml/oceans/helpers";
import {Body, Button} from "@ml/oceans/components/common";
import styles from "@ml/oceans/styles";
import aiBotHead from "@public/images/ai-bot/ai-bot-head.png";
import aiBotBody from "@public/images/ai-bot/ai-bot-body.png";
import counterIcon from "@public/images/polaroid-icon.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBan, faCheck, faTrash} from "@fortawesome/free-solid-svg-icons";
import train from "@ml/oceans/models/train";
import modeHelpers from "@ml/oceans/modeHelpers";

let UnwrappedTrain = class Train extends React.Component {
  state = {
    headOpen: false
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

    return (
      <Body>
        <div style={styles.trainQuestionText}>{state.trainingQuestion}</div>
        <div style={styles.trainBot}>
          <img
            src={aiBotHead}
            style={[
              styles.trainBotHead,
              this.state.headOpen && styles.trainBotOpen
            ]}
          />
          <img src={aiBotBody} style={styles.trainBotBody} />
        </div>
        <div style={styles.counter}>
          <img src={counterIcon} style={styles.counterImg} />
          <span style={styles.counterNum} id="uitest-train-count">
            {Math.min(999, state.yesCount + state.noCount)}
          </span>
        </div>
        <div style={styles.eraseButtonContainer}>
          <FontAwesomeIcon
            icon={faTrash}
            style={styles.eraseButton}
            onClick={() => {
              setState({
                showConfirmationDialog: true,
                confirmationDialogOnYes: resetTrainingFunction
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
