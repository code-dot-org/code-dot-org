import PropTypes from 'prop-types';
import React from 'react';
import * as coreLibrary from './coreLibrary';

export default class SpritelabInput extends React.Component {
  static propTypes = {
    question: PropTypes.string.isRequired
  };

  state = {
    userInput: ''
  };

  userInputSubmit() {
    console.log(this.state.userInput);
    coreLibrary.onUserInputSubmit(this.state.userInput);
  }

  render() {
    return (
      <div id="spritelabInputArea">
        <div>{`Question: ${this.props.question}`}</div>
        <div>
          Answer:
          <input
            type="text"
            onChange={event => this.setState({userInput: event.target.value})}
          />
          <button type="button" onClick={() => this.userInputSubmit()}>
            <i className="fa fa-check" />
          </button>
        </div>
      </div>
    );
  }
}
