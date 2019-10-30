import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getState, setState} from './state';
import {Modes} from './constants';
import {toMode} from './toMode';
import {init as initModel} from './models';
import {onClassifyFish} from './models/train';

const styles = {
  header: {
    position: 'absolute',
    top: 10,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 48
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  },
  body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  content: {
    position: 'absolute',
    top: '10%',
    left: 0,
    width: '100%'
  },
  button: {
    cursor: 'pointer'
  },
  continueButton: {
    marginLeft: 'auto',
    marginRight: 10,
    marginBottom: 10
  },
  button1col: {
    width: '20%',
    display: 'block',
    margin: '0 auto',
    marginTop: '2%',
    marginBottom: '2%'
  },
  button3col: {
    width: '20%',
    marginLeft: '6%',
    marginRight: '6%',
    marginTop: '2%',
    marginBottom: '2%'
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: 22,
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
    fontSize: 22
  },
  trainQuestionText: {
    position: 'absolute',
    top: '18%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 22
  },
  trainQuestionTextDisabled: {
    position: 'absolute',
    top: '18%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 22,
    opacity: 0.5
  },
  trainButtonYes: {
    position: 'absolute',
    top: '80%',
    left: '30%'
  },
  trainButtonNo: {
    position: 'absolute',
    top: '80%',
    left: '60%'
  },
  trainBot: {
    position: 'absolute',
    height: '50%',
    top: '20%',
    left: '70%'
  },
  predictBot: {
    position: 'absolute',
    height: '50%',
    top: '2%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  pondText: {
    position: 'absolute',
    bottom: '3%',
    left: '55%',
    transform: 'translateX(-45%)',
    fontSize: 22,
    width: '70%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: '2%',
    borderRadius: 10,
    color: 'white',
    lineHeight: '32px'
  },
  pondBot: {
    position: 'absolute',
    height: '50%',
    left: 0,
    bottom: 0
  }
};

class Body extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.body}>{this.props.children}</div>;
  }
}

class Header extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.header}>{this.props.children}</div>;
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

class Footer extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    return <div style={styles.footer}>{this.props.children}</div>;
  }
}

class Button extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func
  };

  render() {
    return (
      <button
        type="button"
        style={{...this.props.style, ...styles.button}}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

class ActivityIntro extends React.Component {
  render() {
    return (
      <div>
        <Body>
          <Header>Meet A.I.</Header>
          <div style={styles.activityIntroText}>
            Machine learning and Artificial Intelligence (AI) can give
            recommendations, like when a computer suggests videos to watch or
            products to buy. What else can we teach a computer?
            <br />
            <br />
            Next, you’re going to teach A.I. a new word just by showing examples
            of that type of fish.
          </div>
          <img style={styles.activityIntroBot} src="images/ai-bot-closed.png" />
          <Footer>
            <Button
              style={styles.continueButton}
              onClick={() => {
                const state = getState();
                if (state.loadTrashImages) {
                  setState({currentMode: Modes.TrainingIntro, word: 'FISHY'});
                } else {
                  toMode(Modes.Words);
                }
              }}
            >
              Continue
            </Button>
          </Footer>
        </Body>
      </div>
    );
  }
}

const wordChoices = [
  ['Blue', 'Green', 'Red', 'Round', 'Square'],
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
];

class Words extends React.Component {
  constructor(props) {
    super(props);

    // Randomize word choices and set in state.
    const choices = wordChoices.map(wordSet => {
      return _.shuffle(wordSet);
    });
    this.state = {choices};
  }

  currentItems() {
    const state = getState();
    const itemSet = state.smallWordSet ? 0 : 1;

    return this.state.choices[itemSet];
  }

  onChangeWord(itemIndex) {
    const state = setState({
      word: this.currentItems()[itemIndex],
      currentMode: Modes.TrainingIntro
    });
    initModel(state);
  }

  render() {
    const state = getState();
    const currentItems = this.currentItems();
    const buttonStyle = state.smallWordSet
      ? styles.button1col
      : styles.button3col;

    return (
      <Body>
        <Header>Choose Fish Type</Header>
        <Content>
          <div style={styles.wordsText}>
            What type of fish do you want to train A.I. to detect?
          </div>
          {currentItems.map((item, itemIndex) => (
            <Button
              key={itemIndex}
              style={buttonStyle}
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

class TrainingIntro extends React.Component {
  render() {
    const state = getState();

    return (
      <Body>
        <Header />
        <div style={styles.activityIntroText}>
          Now let's teach A.I. what <b>{state.word.toUpperCase()}</b> fish look
          like.
        </div>
        <img style={styles.trainingIntroBot} src="images/ai-bot-closed.png" />
        <Footer>
          <Button
            style={styles.continueButton}
            onClick={() => toMode(Modes.Training)}
          >
            Continue
          </Button>
        </Footer>
      </Body>
    );
  }
}

class Train extends React.Component {
  render() {
    const state = getState();
    const questionText = `Is this fish ${state.word.toUpperCase()}?`;
    const trainQuestionTextStyle = state.isRunning
      ? styles.trainQuestionTextDisabled
      : styles.trainQuestionText;

    return (
      <Body>
        <Header>A.I. Training</Header>
        <div style={trainQuestionTextStyle}>{questionText}</div>
        <img style={styles.trainBot} src="images/ai-bot-closed.png" />
        <Button
          style={styles.trainButtonYes}
          onClick={() => onClassifyFish(true)}
        >
          Yes
        </Button>
        <Button
          style={styles.trainButtonNo}
          onClick={() => onClassifyFish(false)}
        >
          No
        </Button>
        <Footer>
          <Button
            style={styles.continueButton}
            onClick={() => toMode(Modes.Predicting)}
          >
            Continue
          </Button>
        </Footer>
      </Body>
    );
  }
}

class Predict extends React.Component {
  render() {
    const state = getState();

    return (
      <Body>
        <Header>A.I. Sorting</Header>
        <img style={styles.predictBot} src="images/ai-bot-closed.png" />
        <Footer>
          {state.canSkipPredict && (
            <Button
              style={styles.continueButton}
              onClick={() => toMode(Modes.Pond)}
            >
              Skip
            </Button>
          )}
        </Footer>
      </Body>
    );
  }
}

class Pond extends React.Component {
  render() {
    const state = getState();
    const pondText = `Out of ${
      state.fishData.length
    } objects, A.I. identified ${
      state.pondFish.length
    } that it classified as ${state.word.toUpperCase()}.`;

    return (
      <Body>
        <Header>A.I. Results</Header>
        <div style={styles.pondText}>{pondText}</div>
        <img style={styles.pondBot} src="images/ai-bot-closed.png" />
      </Body>
    );
  }
}

export default class UI extends React.Component {
  render() {
    const mode = getState().currentMode;

    return (
      <div>
        {mode === Modes.ActivityIntro && <ActivityIntro />}
        {mode === Modes.Words && <Words />}
        {mode === Modes.TrainingIntro && <TrainingIntro />}
        {mode === Modes.Training && <Train />}
        {mode === Modes.Predicting && <Predict />}
        {mode === Modes.Pond && <Pond />}
      </div>
    );
  }
}
