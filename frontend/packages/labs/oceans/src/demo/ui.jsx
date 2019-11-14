import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {AppMode, Modes} from './constants';
import {toMode} from './toMode';
import {$time, currentRunTime, finishMovement} from './helpers';
import {onClassifyFish} from './models/train';
import colors from './colors';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import Typist from 'react-typist';
import {getCurrentGuide, dismissCurrentGuide} from './models/guide';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faBackward,
  faForward
} from '@fortawesome/free-solid-svg-icons';

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
    borderRadius: 8,
    minWidth: 160,
    outline: 'none',
    border: `2px solid ${colors.black}`,
    ':focus': {
      outline: `${colors.white} auto 5px`
    }
  },
  continueButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: colors.orange,
    color: colors.white
  },
  backButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: colors.blue,
    color: colors.white
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
  activityIntroText: {
    position: 'absolute',
    fontSize: 22,
    lineHeight: '26px',
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
    fontSize: 22,
    lineHeight: '26px'
  },
  trainQuestionText: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 32,
    lineHeight: '35px'
  },
  trainButtons: {
    position: 'absolute',
    top: '80%',
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
    height: '40%',
    top: '28%',
    left: '76%'
  },
  mediaControls: {
    position: 'absolute',
    width: '100%',
    bottom: 25,
    display: 'flex',
    justifyContent: 'center'
  },
  mediaControl: {
    cursor: 'pointer',
    margin: '0 20px',
    fontSize: 42,
    color: colors.grey,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: colors.orange
    }
  },
  selectedControl: {
    color: colors.black
  },
  timeScale: {
    width: 40,
    fontSize: 24,
    textAlign: 'center'
  },
  predictSpeech: {
    top: '88%',
    left: '12%',
    width: '65%',
    height: 38
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
    height: '40%',
    top: '23%',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-45%)'
  },
  pill: {
    display: 'flex',
    alignItems: 'center'
  },
  pillIcon: {
    width: 19,
    padding: 10,
    borderRadius: 33
  },
  pillText: {
    color: colors.black,
    padding: '10px 30px',
    borderRadius: 33,
    marginLeft: -18
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
    backgroundColor: colors.black,
    color: colors.white,
    textAlign: 'center',
    lineHeight: '140%'
  },
  guideTypingText: {
    position: 'absolute',
    padding: 15
  },
  guideFinalText: {
    padding: 15,
    color: colors.white,
    textAlign: 'center',
    lineHeight: '140%',
    opacity: 0
  },
  guideBackground: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    border: '2px solid transparent'
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
    top: '100%',
    left: '50%',
    border: 'solid transparent',
    height: 0,
    width: 0,
    position: 'absolute',
    pointerEvents: 'none',
    borderColor: 'none',
    borderTopColor: colors.black,
    borderWidth: 30,
    marginLeft: -30
  },
  guideTopLeft: {
    top: '5%',
    left: '5%'
  },
  guideCenter: {
    bottom: '40%',
    left: '50%',
    maxWidth: '47%',
    transform: 'translateX(-50%)'
  },
  guideTopRight: {
    top: '15%',
    right: '13%'
  },
  guideTopRightNarrow: {
    top: '15%',
    right: '2%',
    maxWidth: '40%'
  },
  guideBottomMiddle: {
    bottom: '25%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideBottomRight: {
    bottom: '18%',
    right: '2%',
    maxWidth: '25%'
  },
  guideBottomLeft: {
    bottom: '18%',
    left: '2%',
    maxWidth: '25%'
  },
  guideBottomRightCenter: {
    bottom: '20%',
    right: '5%',
    maxWidth: '25%'
  },
  guideButton: {
    padding: 5,
    minWidth: 100,
    marginTop: 20,
    right: 0
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

let Button = class Button extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  onClick(event) {
    dismissCurrentGuide();
    this.props.onClick(event);
  }

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        style={[styles.button, this.props.style]}
        onClick={event => this.onClick(event)}
      >
        {this.props.children}
      </button>
    );
  }
};
Button = Radium(Button);

const wordSet = {
  short: {
    text: ['What type of fish do you want to train A.I. to detect?'],
    choices: [['Blue', 'Green', 'Red'], ['Triangle', 'Round', 'Square']],
    style: styles.button2col
  },
  long: {
    text: ['Choose a new word to teach A.I.'],
    choices: [
      [
        'Friendly',
        'Funny',
        'Bizarre',
        'Shy',
        'Glitchy',
        'Delicious',
        'Fun',
        'Angry',
        'Fast',
        'Smart',
        'Brave',
        'Scary',
        'Wild',
        'Fierce',
        'Tropical'
      ]
    ],
    style: styles.button3col
  }
};

class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices in each set, merge the sets, and set as state.
    const appMode = getState().appMode;
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
    const word = this.state.choices[itemIndex];
    setState({
      word,
      trainingQuestion: `Is this fish ${word.toUpperCase()}?`
    });
    toMode(Modes.Training);
  }

  render() {
    const state = getState();

    return (
      <Body>
        <Content>
          {wordSet[state.appMode].text && (
            <div style={styles.wordsText}>
              {wordSet[state.appMode].text.map((text, i) => (
                <div key={i}>{text}</div>
              ))}
            </div>
          )}
          {this.state.choices.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              className="words-button"
              style={wordSet[state.appMode].style}
              onClick={() => this.onChangeWord(itemIndex)}
            >
              {item}
            </Button>
          ))}
        </Content>
      </Body>
    );
  }
}

let Train = class Train extends React.Component {
  render() {
    const state = getState();
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'Yes' : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'No' : `Not ${state.word}`;
    return (
      <Body>
        <div style={styles.trainQuestionText}>{state.trainingQuestion}</div>
        <img style={styles.trainBot} src={aiBotClosed} />
        <div style={styles.trainButtons}>
          <Button
            style={styles.trainButtonNo}
            onClick={() => onClassifyFish(false)}
          >
            {noButtonText}
          </Button>
          <Button
            style={styles.trainButtonYes}
            onClick={() => onClassifyFish(true)}
          >
            {yesButtonText}
          </Button>
        </div>
        <Button
          style={styles.continueButton}
          onClick={() => toMode(Modes.Predicting)}
        >
          Continue
        </Button>
      </Body>
    );
  }
};
Train = Radium(Train);

const defaultTimeScale = 1;
const timeScales = [1, 2, 4];
const MediaControl = Object.freeze({
  Rewind: 'rewind',
  Play: 'play',
  FastForward: 'fast-forward'
});

let Predict = class Predict extends React.Component {
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
      toMode(Modes.Pond);
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
    } else {
      selectedControl = MediaControl.Play;
    }

    return (
      <Body>
        {this.state.displayControls && (
          <div style={styles.mediaControls}>
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
              style={[
                styles.mediaControl,
                selectedControl === MediaControl.Play && styles.selectedControl
              ]}
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
          <Button style={styles.continueButton} onClick={this.onRun}>
            Run
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button style={styles.continueButton} onClick={this.onContinue}>
            Continue
          </Button>
        )}
      </Body>
    );
  }
};
Predict = Radium(Predict);

class Pond extends React.Component {
  onPondClick(e) {
    const state = getState();
    const clickX = e.nativeEvent.offsetX;
    const clickY = e.nativeEvent.offsetY;

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
            clickX,
            clickY,
            1,
            1
          )
        ) {
          setState({
            pondClickedFish: {
              id: fishBound.fishId,
              x: fishBound.x,
              y: fishBound.y,
              confidence: fishBound.confidence
            }
          });
          console.log('Fish clicked confidence: ', fishBound.confidence);
          fishClicked = true;
        }
      });

      if (!fishClicked) {
        setState({pondClickedFish: null});
      }
    }
  }

  render() {
    const state = getState();

    const showFishDetails = !!state.pondClickedFish;
    let pondFishDetailsStyle;
    let confidence;
    if (showFishDetails) {
      const fish = state.pondClickedFish;

      const leftX = Math.min(
        Math.max(state.pondClickedFish.x + 200, 20),
        constants.canvasWidth - 210
      );
      const topY = Math.min(
        Math.max(state.pondClickedFish.y, 20),
        constants.canvasHeight - 50
      );

      pondFishDetailsStyle = {
        ...styles.pondFishDetails,
        left: leftX,
        top: topY
      };

      if (!fish.confidence || !fish.confidence.confidencesByClassId) {
        confidence = 'Not confident';
      } else if (fish.confidence.confidencesByClassId[0] > 0.99) {
        confidence = 'Very confident';
      } else if (fish.confidence.confidencesByClassId[0] > 0.5) {
        confidence = 'Fairly confident';
      } else {
        confidence = 'Not very confident';
      }
    }

    return (
      <Body onClick={this.onPondClick}>
        <img style={styles.pondBot} src={aiBotClosed} />
        {showFishDetails && (
          <div style={pondFishDetailsStyle}>{confidence}</div>
        )}
        {state.canSkipPond && (
          <div>
            <Button
              style={styles.continueButton}
              onClick={() => {
                if (state.onContinue) {
                  state.onContinue();
                }
              }}
            >
              Continue
            </Button>
            <Button
              style={styles.backButton}
              onClick={() => {
                toMode(Modes.Training);
              }}
            >
              Train More
            </Button>
          </div>
        )}
      </Body>
    );
  }
}

class Guide extends React.Component {
  onShowing() {
    setState({guideShowing: true});
  }

  render() {
    const currentGuide = getCurrentGuide();

    return (
      <div>
        {!!currentGuide && (
          <div
            key={currentGuide.id}
            style={
              currentGuide.hideBackground
                ? styles.guideBackgroundHidden
                : styles.guideBackground
            }
            onClick={dismissCurrentGuide}
          >
            <div
              style={{...styles.guide, ...styles[`guide${currentGuide.style}`]}}
            >
              <div style={styles.guideTypingText}>
                <Typist
                  avgTypingDelay={35}
                  stdTypingDelay={15}
                  cursor={{show: false}}
                  onTypingDone={this.onShowing}
                >
                  {currentGuide.textFn
                    ? currentGuide.textFn(getState())
                    : currentGuide.text}
                </Typist>
              </div>
              <div style={styles.guideFinalText}>
                {currentGuide.textFn
                  ? currentGuide.textFn(getState())
                  : currentGuide.text}
              </div>
              {getState().guideShowing && currentGuide.arrow !== 'none' && (
                <div>
                  <div style={styles.guideArrow}> </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default class UI extends React.Component {
  render() {
    const currentMode = getState().currentMode;

    return (
      <div>
        {currentMode === Modes.Words && <Words />}
        {currentMode === Modes.Training && <Train />}
        {currentMode === Modes.Predicting && <Predict />}
        {currentMode === Modes.Pond && <Pond />}
      </div>
    );
  }
}
