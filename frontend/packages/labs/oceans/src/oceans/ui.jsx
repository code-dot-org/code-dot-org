import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {AppMode, Modes} from './constants';
import modeHelpers from './modeHelpers';
import helpers, {$time, currentRunTime, finishMovement} from './helpers';
import train from './models/train';
import {arrangeFish} from './models/pond';
import colors from './colors';
import aiBotHead from '@public/images/ai-bot/ai-bot-head.png';
import aiBotBody from '@public/images/ai-bot/ai-bot-body.png';
import aiBotClosed from '@public/images/ai-bot/ai-bot-closed.png';
import counterIcon from '@public/images/polaroid-icon.png';
import arrowDownImage from '@public/images/arrow-down.png';
import snail from '@public/images/snail-large.png';
import loadingGif from '@public/images/loading.gif';
import Typist from 'react-typist';
import guide from './models/guide';
import soundLibrary from './models/soundLibrary';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faBackward,
  faForward,
  faEraser,
  faCheck,
  faBan,
  faInfo,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import * as I18n from './i18n';

const styles = {
  body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  // Note that button fontSize and padding are currently set by surrounding HTML for
  // responsiveness.
  button: {
    cursor: 'pointer',
    backgroundColor: colors.white,
    color: colors.grey,
    fontSize: '100%',
    borderRadius: 8,
    minWidth: '15%',
    outline: 'none',
    border: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 1.3
  },
  continueButton: {
    position: 'absolute',
    bottom: '2%',
    right: '1.2%',
    backgroundColor: colors.orange,
    color: colors.white
  },
  finishButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    position: 'absolute',
    bottom: '2%',
    right: '1.2%'
  },
  playAgainButton: {
    backgroundColor: colors.yellowGreen,
    color: colors.white,
    position: 'absolute',
    bottom: '13.5%',
    right: '1.2%'
  },
  backButton: {
    position: 'absolute',
    bottom: '2%',
    left: '1.2%'
  },
  button2col: {
    width: '20%',
    marginLeft: '14%',
    marginRight: '14%',
    marginTop: '2%'
  },
  button3col: {
    width: '20%',
    marginLeft: '6%',
    marginRight: '6%',
    marginTop: '2%'
  },
  confirmationDialogBackground: {
    backgroundColor: colors.transparentBlack,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zPosition: 1
  },
  confirmationDialog: {
    position: 'absolute',
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: '2%',
    borderRadius: 8
  },
  confirmationDialogContent: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  confirmationDialogImg: {
    position: 'absolute',
    bottom: '-46%',
    left: '-41%',
    height: '100%'
  },
  confirmationHeader: {
    fontSize: '220%',
    color: colors.darkGrey,
    paddingBottom: '5%',
    textAlign: 'center'
  },
  confirmationText: {
    textAlign: 'center',
    backgroundColor: colors.lightGrey,
    padding: '5%',
    borderRadius: 5
  },
  confirmationButtons: {
    paddingTop: '5%',
    clear: 'both'
  },
  confirmationYesButton: {
    backgroundColor: colors.red,
    color: colors.white,
    left: '5%',
    padding: '3.5% 8%',
    width: '35%'
  },
  confirmationNoButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    float: 'right',
    right: '5%',
    padding: '3.5% 8%',
    width: '35%'
  },
  loading: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
    maxWidth: '30%'
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: '120%',
    top: '20%',
    left: '50%',
    width: '80%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  },
  trainingIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '30%',
    left: '50%'
  },
  activityIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  wordsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '120%',
    color: colors.white
  },
  wordButton: {
    ':hover': {
      backgroundColor: colors.orange,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.orange,
      color: colors.white
    }
  },
  trainQuestionText: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '180%',
    color: colors.white,
    whiteSpace: 'nowrap'
  },
  trainButtons: {
    position: 'absolute',
    top: '83%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  trainButtonYes: {
    marginLeft: 10,
    ':hover': {
      backgroundColor: colors.green,
      color: colors.white
    }
  },
  trainButtonNo: {
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    }
  },
  trainBot: {
    position: 'absolute',
    top: '30%',
    right: '-2%',
    width: '30%'
  },
  trainBotHead: {
    transition: 'transform 500ms',
    left: '3%',
    width: '43%',
    top: '0%',
    position: 'absolute'
  },
  trainBotOpen: {
    transform: 'rotate(90deg)',
    transformOrigin: 'bottom right'
  },
  trainBotBody: {
    width: '49%',
    marginTop: '30%'
  },
  counter: {
    position: 'absolute',
    top: '2%',
    right: '7%',
    backgroundColor: colors.transparentBlack,
    color: colors.neonBlue,
    borderRadius: 33,
    textAlign: 'right',
    minWidth: '7%',
    height: '5%',
    padding: '1% 2.5%'
  },
  counterImg: {
    float: 'left',
    height: '100%'
  },
  counterNum: {
    fontSize: '90%'
  },
  eraseButtonContainer: {
    position: 'absolute',
    top: '2%',
    right: '1.2%',
    cursor: 'pointer',
    borderRadius: 50,
    padding: '0.75% 1.2%',
    fontSize: '120%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '6%',
    width: '2.4%',
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.red,
      color: colors.white
    }
  },
  eraseButton: {
    display: 'block',
    margin: 'auto',
    height: '100%'
  },
  mediaControls: {
    position: 'absolute',
    width: '100%',
    bottom: '3.5%',
    display: 'flex',
    justifyContent: 'center'
  },
  mediaControl: {
    cursor: 'pointer',
    margin: '0 20px',
    fontSize: '180%',
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: colors.orange
    },
    ':active': {
      color: colors.orange
    }
  },
  selectedControl: {
    color: colors.orange
  },
  timeScale: {
    width: 40,
    fontSize: '80%',
    textAlign: 'center'
  },
  predictSpeech: {
    top: '88%',
    left: '12%',
    width: '65%',
    height: 38
  },
  pondSurface: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  },
  pondFishDetails: {
    position: 'absolute',
    backgroundColor: colors.transparentWhite,
    padding: '2%',
    borderRadius: 5,
    color: colors.black
  },
  pondBot: {
    position: 'absolute',
    height: '27%',
    top: '59%',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-45%)',
    pointerEvents: 'none'
  },
  pondPanelButton: {
    position: 'absolute',
    top: 24,
    left: 22,
    cursor: 'pointer'
  },
  pondPanelLeft: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    left: '3%',
    top: '16%',
    padding: '2%',
    pointerEvents: 'none'
  },
  pondPanelRight: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    right: '3%',
    top: '16%',
    padding: '2%',
    pointerEvents: 'none'
  },
  pondPanelPreText: {
    marginBottom: '5%'
  },
  pondPanelRow: {
    position: 'relative',
    marginBottom: '7%'
  },
  pondPanelGeneralBar: {
    position: 'absolute',
    top: 0,
    left: '0%',
    height: '150%',
    backgroundColor: colors.teal
  },
  pondPanelGeneralBarText: {
    position: 'absolute',
    top: '30%',
    left: '3%',
    textAlign: 'right'
  },
  pondPanelGreenBar: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: '150%',
    backgroundColor: colors.green
  },
  pondPanelGreenBarText: {
    position: 'absolute',
    top: '30%',
    left: '53%'
  },
  pondPanelRedBar: {
    position: 'absolute',
    top: 0,
    right: '50%',
    height: '150%',
    backgroundColor: colors.red
  },
  pondPanelRedBarText: {
    position: 'absolute',
    top: '30%',
    width: '47%',
    textAlign: 'right'
  },
  pondPanelPostText: {
    marginTop: '3%'
  },
  recallIcons: {
    position: 'absolute',
    top: '2%',
    right: '7%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '8.5%',
    width: '9.5%',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center'
  },
  recallIcon: {
    cursor: 'pointer',
    padding: '0 15%',
    height: '100%'
  },
  infoIconContainer: {
    position: 'absolute',
    top: '2%',
    right: '1.2%',
    cursor: 'pointer',
    borderRadius: 50,
    padding: '0.75% 1.2%',
    fontSize: '120%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '6%',
    width: '2.5%',
    ':hover': {
      backgroundColor: colors.teal,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.teal,
      color: colors.white
    }
  },
  infoIcon: {
    display: 'block',
    margin: 'auto',
    height: '100%'
  },
  bgTeal: {
    backgroundColor: colors.teal,
    color: colors.white
  },
  bgRed: {
    backgroundColor: colors.red,
    color: colors.white
  },
  bgGreen: {
    backgroundColor: colors.green,
    color: colors.white
  },
  count: {
    position: 'absolute',
    top: '3%'
  },
  noCount: {
    right: '9%'
  },
  yesCount: {
    right: 0
  },
  guide: {
    position: 'absolute',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 5,
    maxWidth: '80%',
    bottom: '2%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideImage: {
    position: 'absolute',
    bottom: '1%',
    left: '15%',
    zIndex: 2,
    maxHeight: '45%',
    maxWidth: '35%'
  },
  guideHeading: {
    fontSize: '220%',
    color: colors.darkGrey,
    paddingBottom: '5%',
    textAlign: 'center'
  },
  guideTypingText: {
    position: 'absolute',
    padding: 20
  },
  guideFinalTextContainer: {},
  guideFinalTextInfoContainer: {
    backgroundColor: colors.lightGrey,
    borderRadius: 10
  },
  guideFinalText: {
    padding: 20,
    opacity: 0
  },
  guideBackground: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  },
  guideBackgroundHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  guideArrow: {
    position: 'absolute',
    width: '8%'
  },
  guideInfo: {
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: '2%'
  },
  guideCenter: {
    top: '50%',
    left: '50%',
    bottom: 'initial',
    maxWidth: '47%',
    transform: 'translate(-50%, -50%)'
  },
  infoGuideButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    transform: 'translate(-50%)',
    marginLeft: '50%',
    marginTop: '2%',
    padding: '3% 7%'
  },
  arrowBotRight: {
    top: '15%',
    right: '12.5%',
    transform: 'translateX(-50%)'
  },
  arrowLowerLeft: {
    bottom: '17%',
    left: '8.5%',
    transform: 'translateX(-50%)'
  },
  arrowLowerRight: {
    bottom: '17%',
    right: '0.75%',
    transform: 'translateX(-50%)'
  },
  arrowLowishRight: {
    bottom: '28%',
    right: '0.75%',
    transform: 'translateX(-50%)'
  },
  arrowLowerCenter: {
    bottom: '22%',
    left: '50.5%',
    transform: 'translateX(-50%)'
  },
  arrowUpperRight: {
    top: '13%',
    right: '-2%',
    transform: 'translateX(-50%) rotate(180deg)'
  },
  arrowUpperFarRight: {
    top: '15%',
    right: '-4.6%',
    transform: 'translateX(-50%) rotate(180deg)'
  }
};

function Collide(x1, y1, w1, h1, x2, y2, w2, h2) {
  // Detect a non-collision.
  if (
    x1 + w1 - 1 < x2 ||
    x1 > x2 + w2 - 1 ||
    y1 + h1 - 1 < y2 ||
    y1 > y2 + h2 - 1
  ) {
    return false;
  }

  // Otherwise we have a collision.
  return true;
}

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    return (
      <div style={styles.body} onClick={this.props.onClick}>
        {this.props.children}
        <Guide />
      </div>
    );
  }
}

class Content extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.content}>{this.props.children}</div>;
  }
}

let UnwrappedButton = class Button extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func,
    sound: PropTypes.string
  };

  onClick = event => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick(event);

    if (clickReturnValue !== false) {
      const sound = this.props.sound || 'other';
      soundLibrary.playSound(sound);
    }
  };

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        style={[styles.button, this.props.style]}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};
export const Button = Radium(UnwrappedButton); // Exported for unit tests.

let UnwrappedConfirmationDialog = class ConfirmationDialog extends React.Component {
  static propTypes = {
    onYesClick: PropTypes.func.isRequired,
    onNoClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <div style={styles.confirmationDialogBackground}>
        <div style={styles.confirmationDialog}>
          <div style={styles.confirmationDialogContent}>
            <img src={snail} style={styles.confirmationDialogImg} />
            <div>
              <div
                style={styles.confirmationHeader}
                className="confirmation-text"
              >
                {I18n.t('areYouSure')}
              </div>
              <div style={styles.confirmationText}>
                {I18n.t('eraseWarning')}
              </div>
            </div>
          </div>
          <div style={styles.confirmationButtons}>
            <Button
              onClick={this.props.onYesClick}
              style={styles.confirmationYesButton}
              className="dialog-button"
            >
              <FontAwesomeIcon icon={faEraser} /> {I18n.t('erase')}
            </Button>
            <Button
              onClick={this.props.onNoClick}
              style={styles.confirmationNoButton}
              className="dialog-button"
            >
              {I18n.t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
export const ConfirmationDialog = Radium(UnwrappedConfirmationDialog); // Exported for unit tests.

class Loading extends React.Component {
  render() {
    return (
      <Body>
        <img src={loadingGif} style={styles.loading} />
      </Body>
    );
  }
}

/*
 * The choices for each word set are i18n keys. If adding or changing a word
 * choice, be sure to add the word the way it should appear in i18n/oceans.json.
 * The keys here will also appear in google analytics, so it's worth making
 * them readable in English.
 *
 * */
export const wordSet = {
  short: {
    textKey: 'wordQuestionShort',
    choices: [
      ['blue', 'green', 'red'],
      ['circular', 'rectangular', 'triangular']
    ],
    style: styles.button2col
  },
  long: {
    textKey: 'wordQuestionLong',
    choices: [
      [
        'angry',
        'awesome',
        'delicious',
        'endangered',
        'fast',
        'fierce',
        'fun',
        'glitchy',
        'happy',
        'hungry',
        'playful',
        'scary',
        'silly',
        'spooky',
        'wild'
      ]
    ],
    style: styles.button3col
  }
};

let UnwrappedWords = class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices in each set, merge the sets, and set as state.
    const appMode = getState().appMode;

    if (!wordSet[appMode]) {
      throw `Could not find a set of choices in wordSet for appMode '${appMode}'`;
    }

    const appModeWordSet = wordSet[appMode].choices;
    let choices = [];
    let maxSize = 0;
    // Each subset represents a different column, so merge the subsets
    // Start by shuffling the subsets and finding the max length
    for (var i = 0; i < appModeWordSet.length; ++i) {
      appModeWordSet[i] = _.shuffle(appModeWordSet[i]);
      if (appModeWordSet[i].length > maxSize) {
        maxSize = appModeWordSet[i].length;
      }
    }
    // Iterate through each subset and add those elements to choices
    for (i = 0; i < maxSize; ++i) {
      appModeWordSet.forEach(col => {
        if (col[i]) {
          choices.push(col[i]);
        }
      });
    }

    this.state = {choices};
  }

  onChangeWord(itemIndex) {
    const wordKey = this.state.choices[itemIndex];
    const word = I18n.t(wordKey);
    setState({
      word,
      trainingQuestion: I18n.t('isThisFish', {word: word.toLowerCase()})
    });
    modeHelpers.toMode(Modes.Training);

    // Report an analytics event for the word chosen.
    if (window.trackEvent) {
      const appModeToString = {
        [AppMode.FishShort]: 'words-short',
        [AppMode.FishLong]: 'words-long'
      };

      window.trackEvent('oceans', appModeToString[getState().appMode], wordKey);
    }
  }

  render() {
    const state = getState();

    return (
      <Body>
        <Content>
          {wordSet[state.appMode].textKey && (
            <div style={styles.wordsText}>
              {I18n.t(wordSet[state.appMode].textKey)}{' '}
            </div>
          )}
          {this.state.choices.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              className="words-button"
              style={[wordSet[state.appMode].style, styles.wordButton]}
              onClick={() => this.onChangeWord(itemIndex)}
            >
              {I18n.t(item)}
            </Button>
          ))}
        </Content>
      </Body>
    );
  }
};
export const Words = Radium(UnwrappedWords); // Exported for unit tests.

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
export const Train = Radium(UnwrappedTrain); // Exported for unit tests.

const defaultTimeScale = 1;
const timeScales = [1, 2];
const MediaControl = Object.freeze({
  Rewind: 'rewind',
  Play: 'play',
  FastForward: 'fast-forward'
});

let UnwrappedPredict = class Predict extends React.Component {
  state = {
    displayControls: false,
    timeScale: defaultTimeScale
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
      moveTime: constants.defaultMoveTime / defaultTimeScale
    });
    this.setState({timeScale: defaultTimeScale});
  };

  onScaleTime = rewind => {
    this.finishMovement();
    const nextIdx = timeScales.indexOf(this.state.timeScale) + 1;
    const timeScale =
      nextIdx > timeScales.length - 1 ? timeScales[0] : timeScales[nextIdx];

    setState({
      rewind,
      isRunning: true,
      isPaused: false,
      moveTime: constants.defaultMoveTime / timeScale
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

    return (
      <Body>
        {this.state.displayControls && (
          <div style={styles.mediaControls} id="uitest-media-ctrl">
            <span
              onClick={() => this.onScaleTime(true)}
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.Rewind &&
                  styles.selectedControl
              ]}
              key={MediaControl.Rewind}
            >
              <span style={styles.timeScale}>
                {selectedControl === MediaControl.Rewind &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
              <FontAwesomeIcon icon={faBackward} />
            </span>
            <span
              onClick={this.onPressPlay}
              style={styles.mediaControl}
              key={MediaControl.Play}
            >
              <FontAwesomeIcon icon={state.isRunning ? faPause : faPlay} />
            </span>
            <span
              onClick={() => this.onScaleTime(false)}
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.FastForward &&
                  styles.selectedControl
              ]}
              key={MediaControl.FastForward}
            >
              <FontAwesomeIcon icon={faForward} />
              <span style={styles.timeScale}>
                {selectedControl === MediaControl.FastForward &&
                  this.state.timeScale !== defaultTimeScale &&
                  `x${this.state.timeScale}`}
              </span>
            </span>
          </div>
        )}
        {!state.isRunning && !state.isPaused && (
          <Button
            style={styles.continueButton}
            onClick={this.onRun}
            id="uitest-run-btn"
          >
            <FontAwesomeIcon icon={faPlay} />
            &nbsp; &nbsp; {I18n.t('run')}
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button
            style={styles.continueButton}
            onClick={this.onContinue}
            id="uitest-continue-btn"
          >
            {I18n.t('continue')}
          </Button>
        )}
      </Body>
    );
  }
};
export const Predict = Radium(UnwrappedPredict); // Exported for unit tests.

class PondPanel extends React.Component {
  onPondPanelClick = e => {
    setState({pondPanelShowing: false});
    e.stopPropagation();
  };

  render() {
    const state = getState();

    const maxExplainValue = state.showRecallFish
      ? state.pondRecallFishMaxExplainValue
      : state.pondFishMaxExplainValue;

    return (
      <div>
        {!state.pondClickedFish && (
          <div style={styles.pondPanelLeft} onClick={this.onPondPanelClick}>
            {state.pondExplainGeneralSummary && (
              <div>
                <div style={styles.pondPanelPreText}>
                  {I18n.t('mostImportantParts')}
                </div>
                {state.pondExplainGeneralSummary.slice(0, 5).map((f, i) => (
                  <div key={i}>
                    {f.importance > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGeneralBar,
                            width:
                              (Math.abs(f.importance) /
                                state.pondExplainGeneralSummary[0].importance) *
                                100 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGeneralBarText}>
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div style={styles.pondPanelPostText}>
                  {I18n.t('clickIndividualFish')}
                </div>
              </div>
            )}
          </div>
        )}
        {state.pondClickedFish && (
          <div
            style={
              state.pondPanelSide === 'left'
                ? styles.pondPanelLeft
                : styles.pondPanelRight
            }
            onClick={e => this.onPondPanelClick(e)}
          >
            {state.pondExplainFishSummary && (
              <div>
                <div style={styles.pondPanelPreText}>
                  {I18n.t('mostImportantPartsInDetermining')}
                  {' “'}
                  <span style={{color: colors.green}}>
                    {state.word.toLowerCase()}
                  </span>
                  {'”'} {I18n.t('or')}
                  {' “'}
                  <span style={{color: colors.red}}>
                    {I18n.t('notWord', {word: state.word}).toLowerCase()}
                  </span>
                  {'”'}.
                </div>
                {state.pondExplainFishSummary.slice(0, 4).map((f, i) => (
                  <div key={i}>
                    {f.impact < 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelGreenBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                                2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelGreenBarText}>
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                    {f.impact > 0 && (
                      <div style={styles.pondPanelRow}>
                        &nbsp;
                        <div
                          style={{
                            ...styles.pondPanelRedBar,
                            width:
                              ((Math.abs(f.impact) / maxExplainValue) * 100) /
                                2 +
                              '%'
                          }}
                        >
                          &nbsp;
                        </div>
                        <div style={styles.pondPanelRedBarText}>
                          {I18n.t(f.partType)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

let UnwrappedPond = class Pond extends React.Component {
  constructor(props) {
    super(props);
  }

  toggleRecall = e => {
    const state = getState();

    // No-op if transition is already in progress.
    if (state.pondFishTransitionStartTime) {
      return;
    }

    let currentFishSet, nextFishSet;
    if (state.showRecallFish) {
      currentFishSet = state.recallFish;
      nextFishSet = state.pondFish;
      soundLibrary.playSound('yes');
    } else {
      currentFishSet = state.pondFish;
      nextFishSet = state.recallFish;
      soundLibrary.playSound('no');
    }

    // Don't call arrangeFish if fish have already been arranged.
    if (nextFishSet.length > 0 && !nextFishSet[0].getXY()) {
      arrangeFish(nextFishSet);
    }

    if (currentFishSet.length === 0) {
      // Immediately transition to nextFishSet rather than waiting for empty animation.
      setState({showRecallFish: !state.showRecallFish, pondClickedFish: null});
    } else {
      setState({pondFishTransitionStartTime: $time(), pondClickedFish: null});
    }

    if (e) {
      e.stopPropagation();
    }
  };

  onPondClick = e => {
    // Don't allow pond clicks if a Guide is currently showing.
    if (guide.getCurrentGuide()) {
      return;
    }

    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

    const boundingRect = e.target.getBoundingClientRect();
    const pondWidth = boundingRect.width;
    const pondHeight = boundingRect.height;

    // Scale the click to the pond canvas dimensions.
    const normalizedClickX = (clickX / pondWidth) * constants.canvasWidth;
    const normalizedClickY = (clickY / pondHeight) * constants.canvasHeight;

    const fishCollection = state.showRecallFish
      ? state.recallFish
      : state.pondFish;

    if (state.pondFishBounds) {
      let fishClicked = false;
      // Look through the array in reverse so that we click on a fish that
      // is rendered topmost.
      _.reverse(state.pondFishBounds).forEach(fishBound => {
        // If we haven't already clicked on a fish in this current iteration,
        // and we're not clicking on a fish that is already actively clicked,
        // and we have a collision, then we have clicked on a new fish!
        if (
          !fishClicked &&
          !(
            state.pondClickedFish &&
            fishBound.fishId === state.pondClickedFish.id
          ) &&
          Collide(
            fishBound.x,
            fishBound.y,
            fishBound.w,
            fishBound.h,
            normalizedClickX,
            normalizedClickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y
            }
          });
          fishClicked = true;
          soundLibrary.playSound('yes');

          if (
            state.appMode === AppMode.FishShort ||
            state.appMode === AppMode.FishLong
          ) {
            const clickedFish = fishCollection.find(
              f => f.id === fishBound.fishId
            );
            setState({
              pondExplainFishSummary: state.trainer.explainFish(clickedFish)
            });
            if (normalizedClickX < constants.canvasWidth / 2) {
              setState({pondPanelSide: 'right'});
            } else {
              setState({pondPanelSide: 'left'});
            }
          }
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null});
        soundLibrary.playSound('no');
      }
    }
  };

  onPondPanelButtonClick = e => {
    const state = getState();

    if ([AppMode.FishShort, AppMode.FishLong].includes(state.appMode)) {
      setState({
        pondPanelShowing: !state.pondPanelShowing
      });

      if (state.pondPanelShowing) {
        soundLibrary.playSound('sortno');
      } else {
        soundLibrary.playSound('sortyes');
      }
    }

    if (e) {
      e.stopPropagation();
    }
  };

  render() {
    const state = getState();

    const showInfoButton =
      [AppMode.FishShort, AppMode.FishLong].includes(state.appMode) &&
      state.pondFish.length > 0 &&
      state.recallFish.length > 0;
    const recallIconsStyle = showInfoButton
      ? styles.recallIcons
      : {...styles.recallIcons, right: '1.2%'};

    return (
      <Body>
        <div onClick={this.onPondClick} style={styles.pondSurface} />
        <div style={recallIconsStyle}>
          <FontAwesomeIcon
            icon={faCheck}
            style={{
              ...styles.recallIcon,
              ...{borderTopLeftRadius: 8, borderBottomLeftRadius: 8},
              ...(state.showRecallFish ? {} : styles.bgGreen)
            }}
            onClick={this.toggleRecall}
          />
          <FontAwesomeIcon
            icon={faBan}
            style={{
              ...styles.recallIcon,
              ...{borderTopRightRadius: 8, borderBottomRightRadius: 8},
              ...(state.showRecallFish ? styles.bgRed : {})
            }}
            onClick={this.toggleRecall}
          />
        </div>
        {showInfoButton && (
          <div
            style={{
              ...styles.infoIconContainer,
              ...(!state.pondPanelShowing ? {} : styles.bgTeal)
            }}
            onClick={this.onPondPanelButtonClick}
            id="uitest-info-btn"
          >
            <FontAwesomeIcon icon={faInfo} style={styles.infoIcon} />
          </div>
        )}
        <img style={styles.pondBot} src={aiBotClosed} />
        {state.canSkipPond && (
          <div id="uitest-nav-btns">
            {state.appMode === AppMode.FishLong ? (
              <div>
                <Button
                  style={styles.playAgainButton}
                  onClick={() => {
                    setState({pondClickedFish: null, pondPanelShowing: false});
                    helpers.resetTraining(state);
                    modeHelpers.toMode(Modes.Words);
                  }}
                >
                  {I18n.t('newWord')}
                </Button>
                <Button style={styles.finishButton} onClick={state.onContinue}>
                  {I18n.t('finish')}
                </Button>
              </div>
            ) : (
              <Button style={styles.continueButton} onClick={state.onContinue}>
                {I18n.t('continue')}
              </Button>
            )}
            <div>
              <Button
                style={styles.backButton}
                onClick={() => {
                  modeHelpers.toMode(Modes.Training);
                  setState({pondClickedFish: null, pondPanelShowing: false});
                }}
              >
                {I18n.t('trainMore')}
              </Button>
            </div>
          </div>
        )}
        {state.pondPanelShowing && <PondPanel />}
      </Body>
    );
  }
};
export const Pond = Radium(UnwrappedPond); // Exported for unit tests.

let Guide = class Guide extends React.Component {
  onShowing() {
    clearInterval(getState().guideTypingTimer);
    setState({guideShowing: true, guideTypingTimer: null});
  }

  dismissGuideClick() {
    const dismissed = guide.dismissCurrentGuide();
    if (dismissed) {
      soundLibrary.playSound('other');
    }
  }

  render() {
    const state = getState();
    const currentGuide = guide.getCurrentGuide();

    let guideBgStyle = [styles.guideBackground];
    if (currentGuide) {
      if (currentGuide.noDimBackground) {
        guideBgStyle = [styles.guideBackgroundHidden];
      }

      // Info guides should have a darker background color.
      if (currentGuide.style === 'Info') {
        guideBgStyle.push({backgroundColor: colors.transparentBlack});
      }
    }

    // Start playing the typing sounds.
    if (!state.guideShowing && !state.guideTypingTimer && currentGuide) {
      const guideTypingTimer = setInterval(() => {
        soundLibrary.playSound('no', 0.5);
      }, 1000 / 10);
      setState({guideTypingTimer});
    }

    return (
      <div>
        {currentGuide && currentGuide.image && (
          <img
            src={currentGuide.image}
            style={[styles.guideImage, currentGuide.imageStyle || {}]}
          />
        )}
        {!!currentGuide && (
          <div>
            <div
              key={currentGuide.id}
              style={guideBgStyle}
              onClick={this.dismissGuideClick}
            >
              <div
                style={{
                  ...styles.guide,
                  ...styles[`guide${currentGuide.style}`]
                }}
              >
                <div>
                  {currentGuide.didYouKnow && (
                    <div style={styles.guideHeading}>
                      {I18n.t('didYouKnow')}
                    </div>
                  )}
                  <div style={styles.guideTypingText}>
                    <Typist
                      avgTypingDelay={35}
                      stdTypingDelay={15}
                      cursor={{show: false}}
                      onTypingDone={this.onShowing}
                    >
                      {currentGuide.textFn(getState())}
                    </Typist>
                  </div>
                  <div
                    style={
                      currentGuide.style === 'Info'
                        ? styles.guideFinalTextInfoContainer
                        : styles.guideFinalTextContainer
                    }
                  >
                    <div style={styles.guideFinalText}>
                      {currentGuide.textFn(getState())}
                    </div>
                  </div>
                  {currentGuide.style === 'Info' && (
                    <Button style={styles.infoGuideButton} onClick={() => {}}>
                      {I18n.t('continue')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {currentGuide.arrow && (
              <img
                src={arrowDownImage}
                style={{
                  ...styles.guideArrow,
                  ...styles[`arrow${currentGuide.arrow}`]
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
};
Guide = Radium(Guide);

export default class UI extends React.Component {
  render() {
    const state = getState();
    const currentMode = getState().currentMode;
    const isLoading = [Modes.Loading, Modes.IntermediateLoading].includes(
      currentMode
    );

    return (
      <div>
        {isLoading && <Loading />}
        {currentMode === Modes.Words && <Words />}
        {currentMode === Modes.Training && <Train />}
        {currentMode === Modes.Predicting && <Predict />}
        {currentMode === Modes.Pond && <Pond />}
        {state.showConfirmationDialog && (
          <ConfirmationDialog
            onYesClick={state.confirmationDialogOnYes}
            onNoClick={() => setState({showConfirmationDialog: false})}
          />
        )}
      </div>
    );
  }
}
