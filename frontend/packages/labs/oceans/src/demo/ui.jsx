import React from 'react';
import {getState, setState} from './state';
import {Modes} from './constants';
import {toMode} from './helpers';
import {init as initScene} from './init';
import {onClassifyFish} from './models/train';

const styles = {
  Header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    //height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32
  },
  Footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 50,
    display: 'flex',
    justifyContent: 'space-between'
  },
  Body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  Content: {
    position: 'absolute',
    top: '10%',
    left: 0,
    width: '100%'
  },
  button: {
    cursor: 'pointer'
  },
  heading: {
    border: '2px solid black',
    borderRadius: 20,
    padding: '10px 45px',
    fontSize: 24
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: 24,
    top: '20%',
    width: '98%',
    left: '1%',
    textAlign: 'center'
  },
  trainingIntroBot: {
    position: 'absolute',
    //height: '50%',
    transform: 'translateX(-50%)',
    top: '30%',
    left: '50%'
  },
  activityIntroBot: {
    position: 'absolute',
    //height: '50%',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  continueButton: {
    marginLeft: 'auto'
  },
  wordsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 24
  },
  button1col: {
    width: '20%',
    display: 'block',
    margin: '0 auto',
    marginTop: '2%',
    marginBottom: '2%'
  },
  trainQuestionText: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)'
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
  pondText: {
    position: 'absolute',
    top: '90%',
    left: '50%',
    transform: 'translateX(-50%)'
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
  pondBot: {
    position: 'absolute',
    height: '50%',
    left: '10%',
    bottom: '5%'
  }
};

class Body extends React.Component {
  render() {
    return <div style={styles.Body}>{this.props.children}</div>;
  }
}

class Header extends React.Component {
  render() {
    return <div style={styles.Header}>{this.props.children}</div>;
  }
}

class Content extends React.Component {
  render() {
    return <div style={styles.Content}>{this.props.children}</div>;
  }
}

class Footer extends React.Component {
  render() {
    return <div style={styles.Footer}>{this.props.children}</div>;
  }
}

class Button extends React.Component {
  render() {
    return (
      <button
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
              onClick={() => toMode(Modes.Words)}
            >
              Continue
            </Button>
          </Footer>
        </Body>
      </div>
    );
  }
}

class Words extends React.Component {
  items = [
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

  currentItems() {
    const state = getState();
    const iterationCount = state.iterationCount;
    const itemSet = iterationCount === 0 ? 0 : 1;

    return this.items[itemSet];
  }

  onChangeWord(itemIndex) {
    setState({
      word: this.currentItems()[itemIndex],
      currentMode: Modes.TrainingIntro
    });
    initScene();
  }

  render() {
    const currentItems = this.currentItems();
    const buttonStyle = styles.button1col;

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

    return (
      <Body>
        <Header>A.I. Training</Header>
        <div style={styles.trainQuestionText}>{questionText}</div>
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
    return (
      <Body>
        <Header>A.I. Sorting</Header>
        <img style={styles.predictBot} src="images/ai-bot-closed.png" />
        <Footer>
          <Button
            style={styles.continueButton}
            onClick={() => toMode(Modes.Pond)}
          >
            Skip
          </Button>
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

module.exports = class UI extends React.Component {
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
};
