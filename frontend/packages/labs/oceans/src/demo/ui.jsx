import React from 'react';
import {getState} from './state';
import {Modes} from './constants';
import {toMode} from './helpers';

const styles = {
  headerContainer: {
    width: '100%',
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  footerContainer: {
    width: '100%',
    height: 50,
    display: 'flex',
    justifyContent: 'space-between'
  },
  bodyContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  bodyContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  heading: {
    border: '2px solid black',
    borderRadius: 20,
    padding: '10px 45px'
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: 24,
    top: '5%',
    width: '98%',
    left: '1%',
    textAlign: 'center'
  },
  activityIntroBot: {
    position: 'absolute',
    height: '50%',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  activityIntroContinueButton: {
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
  }
};

class HeaderContainer extends React.Component {
  render() {
    return <div style={styles.headerContainer}>{this.props.children}</div>;
  }
}

class BodyContainer extends React.Component {
  render() {
    return (
      <div style={styles.bodyContainer}>
        <div style={styles.bodyContent}>{this.props.children}</div>
      </div>
    );
  }
}

class FooterContainer extends React.Component {
  render() {
    return <div style={styles.footerContainer}>{this.props.children}</div>;
  }
}

class Button extends React.Component {
  render() {
    return (
      <button style={this.props.style} onClick={this.props.onClick}>
        {this.props.children}
      </button>
    );
  }
}

class ActivityIntro extends React.Component {
  render() {
    return (
      <div>
        <HeaderContainer>headerContainer</HeaderContainer>
        <BodyContainer>
          <div style={styles.activityIntroText}>
            <b>Meet A.I.</b>
            <br />
            <br />
            Machine learning and Artificial Intelligence (AI) can give
            recommendations, like when a computer suggests videos to watch or
            products to buy. What else can we teach a computer?
            <br />
            <br />
            Next, you’re going to teach A.I. a new word just by showing examples
            of that type of fish.
          </div>
          <img style={styles.activityIntroBot} src="images/ai-bot-closed.png" />
        </BodyContainer>
        <FooterContainer>
          <Button
            style={styles.activityIntroContinueButton}
            onClick={() => toMode(Modes.Words)}
          >
            Continue
          </Button>
        </FooterContainer>
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

  onChangeWord() {
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
      <div>
        <HeaderContainer>
          <div style={styles.heading}>Choose Fish Type</div>
        </HeaderContainer>
        <BodyContainer>
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
        </BodyContainer>
        <FooterContainer />
      </div>
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
      </div>
    );
  }
};
