import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React from 'react';
import memoize from 'memoize-one';
import * as shapes from '../shapes';
import {PromptType, popPrompt} from './spritelabInputModule';
import * as coreLibrary from './coreLibrary';

const styles = {
  container: {
    background: 'rgba(34, 42, 51, 0.85)',
    textAlign: 'center',
    position: 'absolute',
    bottom: 0,
    width: '100%'
  },
  prompt: {
    color: 'white',
    fontSize: 15
  },
  promptText: {
    lineHeight: '2em',
    verticalAlign: 'middle',
    display: 'inline-block',
    maxWidth: 'calc(100% - 100px)',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  icon: {
    color: 'white'
  },
  inputRow: {
    padding: 0,
    marginBottom: 2,
    marginTop: 2
  },
  inputArea: {
    width: 'calc(100% - 80px)',
    margin: 0
  },
  submitButton: {
    padding: 4,
    margin: '2px 5px'
  },
  circle: {
    position: 'absolute',
    left: 10,
    paddingRight: 8,
    paddingTop: 6,
    fontSize: 11
  },
  number: {
    color: 'rgb(34, 42, 51)',
    fontSize: 9
  },
  choiceButton: {
    fontSize: 15,
    padding: 5,
    margin: '0px 8px',
    maxWidth: 'calc(33% - 16px)',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  choiceSprite: {
    margin: '0px 8px',
    height: 32,
    width: 32,
    objectFit: 'contain'
  }
};

class SpritelabInput extends React.Component {
  static propTypes = {
    animationList: shapes.AnimationList.isRequired,
    inputList: PropTypes.arrayOf(
      PropTypes.shape({
        promptType: PropTypes.string,
        promptText: PropTypes.string,
        variableName: PropTypes.string,
        choices: PropTypes.arrayOf(PropTypes.string)
      })
    ).isRequired,
    onPromptAnswer: PropTypes.func.isRequired
  };

  state = {
    userInput: '',
    collapsed: false
  };

  userInputSubmit(value) {
    const variableName =
      this.props.inputList[0] && this.props.inputList[0].variableName;
    if (!variableName) {
      return;
    }
    this.props.onPromptAnswer();
    coreLibrary.onPromptAnswer(variableName, value);
  }

  onTextSubmit = () => {
    this.userInputSubmit(this.state.userInput);
    this.setState({userInput: ''});
  };

  onMultipleChoiceSubmit = e => {
    this.userInputSubmit(e.target.getAttribute('value'));
  };

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  constructSpriteMap = memoize(animationPropsByKey => {
    const spriteMap = {};
    Object.values(animationPropsByKey).forEach(
      animation => (spriteMap[`image_${animation.name}`] = animation.sourceUrl)
    );
    return spriteMap;
  });

  render() {
    const spriteMap = this.constructSpriteMap(
      this.props.animationList.propsByKey
    );
    const inputInfo = this.props.inputList[0];
    if (!inputInfo) {
      return null;
    }
    const icon = this.state.collapsed ? 'angle-right' : 'angle-down';
    const numPrompts = this.props.inputList.length;
    const promptText = inputInfo.promptText;

    let inputRow;
    switch (inputInfo.promptType) {
      case PromptType.TEXT:
        inputRow = (
          <div style={styles.inputRow}>
            <input
              style={styles.inputArea}
              type="text"
              onChange={event => this.setState({userInput: event.target.value})}
              value={this.state.userInput || ''}
            />
            <button
              style={styles.submitButton}
              type="button"
              onClick={this.onTextSubmit}
            >
              <i className="fa fa-check" />
            </button>
          </div>
        );
        break;
      case PromptType.MULTIPLE_CHOICE: {
        const choices = inputInfo.choices.filter(choice => !!choice);
        inputRow = (
          <div style={styles.inputRow}>
            {choices.map((choice, index) =>
              !!spriteMap[choice] ? (
                <img
                  key={choice + index}
                  style={styles.choiceSprite}
                  src={spriteMap[choice]}
                  value={choice}
                  onClick={this.onMultipleChoiceSubmit}
                />
              ) : (
                <button
                  key={choice + index}
                  style={styles.choiceButton}
                  type="button"
                  value={choice}
                  onClick={this.onMultipleChoiceSubmit}
                >
                  {choice}
                </button>
              )
            )}
          </div>
        );
        break;
      }
      default:
        console.warn(`unknown prompt type: ${inputInfo.promptType}`);
    }

    return (
      <div id="spritelabInputArea" style={styles.container}>
        <div style={styles.prompt}>
          {numPrompts > 1 && (
            <span style={styles.circle} className="fa-stack">
              <i className="fa fa-circle fa-stack-2x" />
              <strong className="fa-stack-1x" style={styles.number}>
                {numPrompts}
              </strong>
            </span>
          )}
          <div style={styles.promptText}>{promptText}</div>
          <a onClick={this.toggleCollapsed}>
            <span style={styles.icon} className="fa-stack">
              <i className={`fa fa-${icon} fa-stack-2x`} />
            </span>
          </a>
        </div>
        {!this.state.collapsed && inputRow}
      </div>
    );
  }
}

export default connect(
  state => ({
    animationList: state.animationList,
    inputList: state.spritelabInputList || []
  }),
  dispatch => ({
    onPromptAnswer: () => dispatch(popPrompt())
  })
)(SpritelabInput);
