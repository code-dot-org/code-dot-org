import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import React from 'react';
import {popQuestion} from './spritelabInputModule';
import * as coreLibrary from './coreLibrary';

class SpritelabInput extends React.Component {
  static propTypes = {
    inputList: PropTypes.array.isRequired,
    onQuestionAnswer: PropTypes.func.isRequired
  };

  state = {
    userInput: ''
  };

  userInputSubmit() {
    const variableName =
      this.props.inputList[0] && this.props.inputList[0].variableName;
    if (!variableName) {
      return;
    }
    this.props.onQuestionAnswer();
    coreLibrary.onQuestionAnswer(variableName, this.state.userInput);
    this.setState({userInput: ''});
  }

  render() {
    const questionText =
      this.props.inputList[0] && this.props.inputList[0].questionText;
    if (!questionText) {
      return null;
    }
    return (
      <div id="spritelabInputArea">
        <div>{`Question: ${questionText}`}</div>
        <div>
          Answer:
          <input
            type="text"
            onChange={event => this.setState({userInput: event.target.value})}
            value={this.state.userInput || ''}
          />
          <button type="button" onClick={() => this.userInputSubmit()}>
            <i className="fa fa-check" />
          </button>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    inputList: state.spritelabInputList || []
  }),
  dispatch => ({
    onQuestionAnswer: () => dispatch(popQuestion())
  })
)(SpritelabInput);
