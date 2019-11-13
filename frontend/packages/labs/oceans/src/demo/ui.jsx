import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import _ from 'lodash';
import {getState, setState} from './state';
import constants, {AppMode, Modes} from './constants';
import {toMode} from './toMode';
import {onClassifyFish} from './models/train';
import colors from './colors';
import aiBotClosed from '../../public/images/ai-bot/ai-bot-closed.png';
import xIcon from '../../public/images/x-icon.png';
import checkmarkIcon from '../../public/images/checkmark-icon.png';
import Typist from 'react-typist';
import {getCurrentGuide, dismissCurrentGuide} from './models/guide';
import {loadSounds, playSound} from './models/soundLibrary';
import {randomInt} from './helpers';

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
  trainQuestionTextDisabled: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 32,
    lineHeight: '35px',
    opacity: 0.5
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
  guideBottomMiddle: {
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideBottomMiddleButtons: {
    bottom: '30%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideBottomRight: {
    bottom: '25%',
    right: '5%'
  },
  guideBottomRightNarrow: {
    bottom: '25%',
    right: '2%',
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

var $time =
  Date.now ||
  function() {
    return +new Date();
  };

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
    onClick: PropTypes.func,
    sound: PropTypes.string
  };

  onClick(event) {
    if (this.props.sound) {
      playSound(this.props.sound + "_" + randomInt(1,10));
    }

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

let Pill = class Pill extends React.Component {
  static propTypes = {
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.string,
    iconBgColor: PropTypes.string,
    style: PropTypes.object
  };

  render() {
    const {text, icon, iconBgColor} = this.props;

    let iconStyle = styles.pillIcon;
    iconStyle.backgroundColor = iconBgColor || colors.white;

    return (
      <div style={[styles.pill, this.props.style]}>
        {icon && <img src={icon} style={iconStyle} />}
        <div style={styles.pillText}>{text}</div>
      </div>
    );
  }
};
Pill = Radium(Pill);

const wordSet = {
  short: {
    text: ['What type of fish do you want to train A.I. to detect?'],
    choices: [['Blue', 'Green', 'Red'], ['Triangle', 'Round', 'Square']],
    style: styles.button2col
  },
  long: {
    text: [
      'What happens if the words are more subjective?',
      'Choose a new word to teach A.I.'
    ],
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
    const trainQuestionTextStyle = state.isRunning
      ? styles.trainQuestionTextDisabled
      : styles.trainQuestionText;
    const yesButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'Yes' : state.word;
    const noButtonText =
      state.appMode === AppMode.CreaturesVTrash ? 'No' : `Not ${state.word}`;
    return (
      <Body>
        <div style={trainQuestionTextStyle}>{state.trainingQuestion}</div>
        <img style={styles.trainBot} src={aiBotClosed} />
        <Pill
          text={state.noCount}
          icon={xIcon}
          iconBgColor={colors.red}
          style={[styles.count, styles.noCount]}
        />
        <Pill
          text={state.yesCount}
          icon={checkmarkIcon}
          iconBgColor={colors.green}
          style={[styles.count, styles.yesCount]}
        />
        <div style={styles.trainButtons}>
          <Button
            style={styles.trainButtonNo}
            onClick={() => onClassifyFish(false)}
            sound={"no"}
          >
            {noButtonText}
          </Button>
          <Button
            style={styles.trainButtonYes}
            onClick={() => onClassifyFish(true)}
            sound={"yes"}
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

class Predict extends React.Component {
  render() {
    const state = getState();

    return (
      <Body>
        {!state.isRunning && !state.showBiasText && (
          <Button
            style={styles.continueButton}
            onClick={() => setState({isRunning: true, runStartTime: $time()})}
          >
            Run A.I.
          </Button>
        )}
        {(state.isRunning || state.isPaused) && state.canSkipPredict && (
          <Button
            style={styles.continueButton}
            onClick={() => {
              if (state.showBiasText) {
                if (state.onContinue) {
                  state.onContinue();
                }
              } else {
                toMode(Modes.Pond);
              }
            }}
          >
            Continue
          </Button>
        )}
      </Body>
    );
  }
}

class Pond extends React.Component {
  constructor(props) {
    super(props);

    playSound("ambience");
  }

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

  dismissGuideClick() {
    playSound("other_" + randomInt(1,4));

    dismissCurrentGuide();
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
            onClick={this.dismissGuideClick}
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
  constructor(props) {
    super(props);

    loadSounds();
  }

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
