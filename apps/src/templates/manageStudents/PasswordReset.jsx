import React, {Component, PropTypes} from 'react';
import Button from '../Button';

const styles = {
  input: {
    width: 100,
    height: 29,
    marginTop: '-25px',
    marginRight: 10,
  }
};

class PasswordReset extends Component {
  static propTypes = {
    resetAction: PropTypes.func.isRequired,
    isResetting: PropTypes.bool
  };

  state = {
    isResetting: !!this.props.isResetting,
    input: ''
  };

  reset = () => {
    this.setState({
      isResetting: true
    });
  };

  save = () => {
    //Todo: do we also want a cancel button?

    //Save the inputted password
    this.props.resetAction(this.state.input);

    this.setState({
      isResetting: false,
      input: ''
    });
  };

  updateInput = (event) => {
    this.setState({
      input: event.target.value
    });
  };

  render() {
    return (
      <div>
        {!this.state.isResetting &&
          <Button onClick={this.reset} color="white" text="Reset password" />
        }
        {this.state.isResetting &&
          <div>
            <input
              style={styles.input}
              placeholder="new password"
              value={this.state.input}
              onChange={this.updateInput}
            />
            <Button onClick={this.save} color="blue" text="Save" />
          </div>
        }
      </div>
    );
  }
}

export default PasswordReset;
