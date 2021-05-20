/**
 * This component is a simple wrapper for buttons that need to be styled to match
 * old Bootstrap-style buttons. At the time of writing, this should only be used
 * for components related to accounts, as that UI still uses Bootstrap styles.
 * This component will be removed upon redesigning the "Edit Account" UI.
 */

import PropTypes from 'prop-types';
import React from 'react';

const BUTTON_TYPE = {
  DANGER: 'danger',
  SUBMIT: 'submit'
};

export default class BootstrapButton extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    text: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(BUTTON_TYPE))
  };

  buttonClasses = () => {
    switch (this.props.type) {
      case BUTTON_TYPE.DANGER:
        return 'btn btn-danger';
      default:
        return 'btn';
    }
  };

  buttonType = () => {
    switch (this.props.type) {
      case BUTTON_TYPE.SUBMIT:
        return 'submit';
      default:
        return 'button';
    }
  };

  render() {
    const {style, onClick, disabled, text} = this.props;

    return (
      // for some reason, the 'button has type' rule isn't able to recognize
      // that we are actually passing a valid button type here. Valid types
      // include "button", "submit", or "reset", and we are currently always
      // returning either "button" or "submit".
      // see https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/button-has-type.md
      // eslint-disable-next-line react/button-has-type
      <button
        type={this.buttonType()}
        className={this.buttonClasses()}
        style={{...styles.button, ...style}}
        onClick={onClick}
        tabIndex="1"
        disabled={disabled}
      >
        {text}
      </button>
    );
  }
}

const styles = {
  button: {
    margin: 0
  }
};
