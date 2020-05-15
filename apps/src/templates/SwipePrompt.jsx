/* global navigator */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import cookies from 'js-cookie';
import {dismissSwipeOverlay} from '@cdo/apps/templates/arrowDisplayRedux';
import trackEvent from '@cdo/apps/util/trackEvent';

const styles = {
  overlay: {
    position: 'absolute',
    zIndex: 1,
    opacity: '90%'
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

function hideOverlayCookieSet() {
  return cookies.get(HideSwipeOverlayCookieName) && !SwipeOverlayOverrideSet;
}

export class SwipePrompt extends React.Component {
  static propTypes = {
    useMinecraftStyling: PropTypes.bool,

    // from redux
    buttonsAreVisible: PropTypes.bool.isRequired,
    buttonsAreDisabled: PropTypes.bool.isRequired,
    hasBeenDismissed: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    dismissAction: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    if (SwipeOverlayOverrideSet) {
      cookies.remove(HideSwipeOverlayCookieName, {path: '/'});
    }
  }

  componentDidUpdate(prevProps) {
    const {hasBeenDismissed, dismissAction} = this.props;
    if (
      hasBeenDismissed &&
      !prevProps.hasBeenDismissed &&
      !hideOverlayCookieSet()
    ) {
      // The overlay was just dismissed. Don't show it again for a while.
      cookies.set(HideSwipeOverlayCookieName, 'true', {expires: 30, path: '/'});
      trackEvent('Research', 'HideSwipeOverlay', 'hide-' + dismissAction);
    }
  }

  render() {
    const {
      onDismiss,
      buttonsAreVisible,
      buttonsAreDisabled,
      hasBeenDismissed,
      useMinecraftStyling
    } = this.props;
    if (
      hideOverlayCookieSet() ||
      hasBeenDismissed ||
      !(TouchSupported || SwipeOverlayOverrideSet) ||
      !buttonsAreVisible ||
      buttonsAreDisabled
    ) {
      // We only want to display the overlay if it would be useful. i.e. the
      // code is running, the arrow buttons are usable, touch is supported, and
      // the user hasn't seen the overlay recently
      return null;
    }
    const promptStyle = useMinecraftStyling
      ? {...styles.overlay, ...styles.minecraft}
      : styles.overlay;

    return (
      <svg
        onTouchStart={() => onDismiss('onOverlayTouch')}
        onClick={() => onDismiss('onOverlayClick')}
        style={promptStyle}
        height={400}
        width={400}
      >
        <image
          height={400}
          width={400}
          xlinkHref={'/blockly/media/common_images/swipe-directions.png'}
        />
        <image
          height={100}
          width={100}
          x={160}
          y={190}
          xlinkHref={'/blockly/media/common_images/touch-icon.png'}
        />
      </svg>
    );
  }
}

export default connect(
  state => ({
    buttonsAreVisible: state.arrowDisplay.buttonsAreVisible,
    buttonsAreDisabled: state.arrowDisplay.buttonsAreDisabled,
    hasBeenDismissed: state.arrowDisplay.swipeOverlayHasBeenDismissed,
    dismissAction: state.arrowDisplay.swipeOverlayDismissAction
  }),
  dispatch => ({
    onDismiss(action) {
      dispatch(dismissSwipeOverlay(action));
    }
  })
)(SwipePrompt);
