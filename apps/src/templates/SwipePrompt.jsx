/* global navigator */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import cookies from 'js-cookie';

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
const TouchSupported = 'ontouchstart' in window || navigator.maxTouchPoints;

const HideSwipeOverlayCookieName = 'hide_swipe_overlay';

const SwipeOverlayOverrideSet =
  window.location.search.indexOf('force_show_swipe_overlay') !== -1;

export class SwipePrompt extends React.Component {
  static propTypes = {
    useMinecraftStyling: PropTypes.bool,

    // from redux
    buttonsAreVisible: PropTypes.bool.isRequired,
    buttonsAreDisabled: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    if (SwipeOverlayOverrideSet) {
      cookies.remove(HideSwipeOverlayCookieName, {path: '/'});
    }

    this.state = {hasBeenDismissed: cookies.get(HideSwipeOverlayCookieName)};
  }

  onDismiss = () => {
    this.setState({hasBeenDismissed: true});
    cookies.set(HideSwipeOverlayCookieName, 'true', {expires: 30, path: '/'});
  };

  render() {
    const {buttonsAreVisible, buttonsAreDisabled} = this.props;
    const {hasBeenDismissed} = this.state;
    if (
      hasBeenDismissed ||
      !(TouchSupported || SwipeOverlayOverrideSet) ||
      !buttonsAreVisible ||
      buttonsAreDisabled
    ) {
      return null;
    }
    const promptStyle = this.props.useMinecraftStyling
      ? {...styles.overlay, ...styles.minecraft}
      : styles.overlay;
    return (
      <svg
        onTouchStart={this.onDismiss}
        onClick={this.onDismiss}
        style={promptStyle}
        height={400}
        width={400}
      >
        <text x={75} y={200} fontSize="35px">
          HELLO WORLD!!!
        </text>
      </svg>
    );
  }
}

export default connect(state => ({
  buttonsAreVisible: state.arrowDisplay.buttonsAreVisible,
  buttonsAreDisabled: state.arrowDisplay.buttonsAreDisabled
}))(SwipePrompt);
