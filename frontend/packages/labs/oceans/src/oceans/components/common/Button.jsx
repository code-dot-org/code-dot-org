import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import styles from '@/oceans/styles';

const UnwrappedButton = class Button extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onClick: PropTypes.func,
    sound: PropTypes.string,
  };

  onClick = event => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick(event);

    if (clickReturnValue !== false) {
      const sound = this.props.sound || 'other';
      soundLibrary.playSound(sound);
    }
  };

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        style={[styles.button, this.props.style]}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};

export default Radium(UnwrappedButton);
