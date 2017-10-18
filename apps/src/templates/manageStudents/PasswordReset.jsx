import React, {Component, PropTypes} from 'react';
import Button from '../Button';
import i18n from "@cdo/locale";

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

  cancel = () => {
    this.setState({
      isResetting: false,
      input: ''
    });
  };

  save = () => {
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
          <Button onClick={this.reset} color="white" text={i18n.resetPassword()} />
        }
        {this.state.isResetting &&
          <div>
            <input
              style={styles.input}
              placeholder={i18n.newPassword()}
              value={this.state.input}
              onChange={this.updateInput}
            />
            <Button onClick={this.save} color="blue" text={i18n.save()} />
            <div>
              <Button onClick={this.cancel} color="white" text={i18n.cancel()} />
            </div>
          </div>
        }
      </div>
    );
  }
}

export default PasswordReset;
