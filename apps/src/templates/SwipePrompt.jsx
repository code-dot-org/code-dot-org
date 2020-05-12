/* global navigator */
import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  overlay: {
    background: 'white',
    position: 'absolute',
    zIndex: 1,
    opacity: '50%'
  },
  minecraft: {
    top: '62px',
    left: '17px'
  }
};

// Note: this method is not foolproof for detecting touch support. It is
// impossible to detect with 100% certainty.
// http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints;

export default class SwipePrompt extends React.Component {
  static propTypes = {
    useMinecraftStyling: PropTypes.bool
  }
  state = {
    // Make this visible if touch events are supported.
    visible: touchSupported
  }

  onDismiss = () => {
    this.setState({visible: false});
  };

  render() {
    if (!this.state.visible) {
      return null;
    }
    const promptStyle = this.props.useMinecraftStyling ? {...styles.overlay, ...styles.minecraft} : styles.overlay;
    return (
      <svg
        onTouchStart={this.onDismiss}
        onClick={this.onDismiss}
        style={promptStyle}
        height={400}
        width={400}
      >
        HELLO WORLD!
      </svg>
    );
  }
}