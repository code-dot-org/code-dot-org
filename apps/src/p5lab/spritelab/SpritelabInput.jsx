import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React from 'react';
import memoize from 'memoize-one';
import * as shapes from '../shapes';
import {KeyCodes} from '@cdo/apps/constants';
import {selectors} from '@cdo/apps/lib/tools/jsdebugger/redux';
import {PromptType, popPrompt} from '../redux/spritelabInput';
import * as coreLibrary from './coreLibrary';

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
    onPromptAnswer: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired
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

  onInputKeyDown = e => {
    if (e.keyCode === KeyCodes.ENTER) {
      this.onTextSubmit();
    }
  };

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
    const disabled = this.props.isPaused || !this.props.isRunning;

    let inputRow;
    switch (inputInfo.promptType) {
      case PromptType.TEXT:
        inputRow = (
          <div style={styles.inputRow}>
            <input
              style={styles.inputArea}
              type="text"
              onKeyDown={this.onInputKeyDown}
              onChange={event => this.setState({userInput: event.target.value})}
              value={this.state.userInput || ''}
              disabled={disabled}
            />
            <button
              style={styles.submitButton}
              type="button"
              onClick={this.onTextSubmit}
              disabled={disabled}
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
                <button
                  key={choice + index}
                  type="button"
                  onClick={this.onMultipleChoiceSubmit}
                  disabled={disabled}
                  style={styles.choiceSpriteContainer}
                >
                  <img
                    src={spriteMap[choice]}
                    value={choice}
                    style={styles.choiceSpriteImage}
                  />
                </button>
              ) : (
                <button
                  key={choice + index}
                  style={styles.choiceButton}
                  type="button"
                  value={choice}
                  onClick={this.onMultipleChoiceSubmit}
                  disabled={disabled}
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
  choiceSpriteContainer: {
    padding: 0,
    background: 'transparent',
    border: '1px solid transparent'
  },
  choiceSpriteImage: {
    margin: 0,
    height: 32,
    width: 32,
    objectFit: 'contain',
    opacity: 1
  }
};

export default connect(
  state => ({
    animationList: state.animationList,
    inputList: state.spritelabInputList || [],
    isRunning: selectors.isRunning(state),
    isPaused: selectors.isPaused(state)
  }),
  dispatch => ({
    onPromptAnswer: () => dispatch(popPrompt())
  })
)(SpritelabInput);
