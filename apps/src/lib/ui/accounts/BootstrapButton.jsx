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

export default class BootstrapButton extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    text: PropTypes.string.isRequired
  };

  render() {
    const {style, onClick, disabled, text} = this.props;

    return (
      <button
        className="btn"
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
