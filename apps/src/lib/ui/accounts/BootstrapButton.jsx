/**
 * This component is a simple wrapper for buttons that need to be styled to match
 * old Bootstrap-style buttons. At the time of writing, this should only be used
 * for components related to accounts, as that UI still uses Bootstrap styles.
 * This component will be removed upon redesigning the "Edit Account" UI.
 */

import React, {PropTypes} from 'react';

const styles = {
  button: {
    margin: 0
  },
};

const BUTTON_TYPE = {
  DANGER: 'danger',
};

export default class BootstrapButton extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    text: PropTypes.string.isRequired,
    type: PropTypes.oneOf(Object.values(BUTTON_TYPE)),
  };

  buttonClasses = () => {
    switch (this.props.type) {
      case BUTTON_TYPE.DANGER:
        return 'btn btn-danger';
      default:
        return 'btn';
    }
  };

  render() {
    const {style, onClick, disabled, text} = this.props;

    return (
      <button
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
