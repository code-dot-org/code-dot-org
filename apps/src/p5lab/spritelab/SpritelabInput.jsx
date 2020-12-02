import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React from 'react';
import {popPrompt} from './spritelabInputModule';
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
    maxWidth: 'calc(100% - 60px)',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  icon: {
    color: 'white'
  },
  inputRow: {
    padding: 0
  },
  inputArea: {
    width: 'calc(100% - 80px)',
    marginBottom: 2,
    marginTop: 2
  },
  submitButton: {
    padding: 4,
    margin: '2px 5px'
  }
};

class SpritelabInput extends React.Component {
  static propTypes = {
    inputList: PropTypes.array.isRequired,
    onPromptAnswer: PropTypes.func.isRequired
  };

  state = {
    userInput: '',
    collapsed: false
  };

  userInputSubmit() {
    const variableName =
      this.props.inputList[0] && this.props.inputList[0].variableName;
    if (!variableName) {
      return;
    }
    this.props.onPromptAnswer();
    coreLibrary.onPromptAnswer(variableName, this.state.userInput);
    this.setState({userInput: ''});
  }

  toggleCollapsed = () =>
    this.setState({
      collapsed: !this.state.collapsed
    });

  render() {
    const icon = this.state.collapsed ? 'angle-right' : 'angle-down';
    const numPrompts = this.props.inputList.length;
    const promptText =
      this.props.inputList[0] && this.props.inputList[0].promptText;
    if (!promptText) {
      return null;
    }
    return (
      <div id="spritelabInputArea" style={styles.container}>
        <div style={styles.prompt}>
          <span className="fa-stack">
            <i className="fa fa-circle fa-stack-2x" />
            <strong className="fa-stack-1x" style={{color: '#222A33'}}>
              {numPrompts}
            </strong>
          </span>
          <a onClick={this.toggleCollapsed}>
            <span style={styles.icon} className="fa-stack">
              <i className={`fa fa-${icon} fa-stack-2x`} />
            </span>
          </a>
          <div style={styles.promptText}>{promptText}</div>
        </div>
        {!this.state.collapsed && (
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
              onClick={() => this.userInputSubmit()}
            >
              <i className="fa fa-check" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    inputList: state.spritelabInputList || []
  }),
  dispatch => ({
    onPromptAnswer: () => dispatch(popPrompt())
  })
)(SpritelabInput);
