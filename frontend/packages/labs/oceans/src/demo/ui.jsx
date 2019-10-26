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
  }
};

class HeaderContainer extends React.Component {
  render() {
    return <div style={styles.headerContainer}>{this.props.children}</div>;
  }
}

class BodyContainer extends React.Component {
  render() {
    return <div style={styles.bodyContainer}>{this.props.children}</div>;
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

module.exports = class UI extends React.Component {
  render() {
    const mode = getState().currentMode;

    return (
      <div>
        {mode === Modes.ActivityIntro && <ActivityIntro />}
        {mode === Modes.Words && <div />}
      </div>
    );
  }
};
