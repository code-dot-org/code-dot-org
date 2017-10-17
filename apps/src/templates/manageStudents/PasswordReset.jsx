import React, {Component, PropTypes} from 'react';
import Button from '../Button';

class PasswordReset extends Component {
  static PropTypes = {
    presetAction: PropTypes.func.isRequired,
    isResetting: PropTypes.bool
  };

  render() {
    return (
      <Button onClick={() => {}} color="white" text="Reset password" />
    );
  }
}

export default PasswordReset;
