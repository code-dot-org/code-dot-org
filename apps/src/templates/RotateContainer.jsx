
import React, {PropTypes} from 'react';
const msg = require('@cdo/locale');

// NOTE: We still have a media query style associated with this component
// in RotateContainer.scss which controls the display attribute (none vs block)
const styles = {
  rotateContainer: {
    position: 'fixed',
    zIndex: 10001,
    backgroundColor: 'white',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  rotateContainerInner: {
    width: '100vw',
    height: '100vh',
    backgroundPosition: '50% 50%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
  },
  rotateText: {
    position: 'relative',
    top: '50%',
    left: '-50%',
    marginLeft: '50px',
    marginRight: '-50px',
  },
  paragraph: {
    textAlign: 'center',
    fontSize: '26px',
    lineHeight: '26px',
    transform: 'rotate(90deg)',
    WebkitTransform: 'rotate(90deg)',
  }
};

/**
 * "Rotate your device" overlay.
 */
const RotateContainer = React.createClass({
  propTypes: {
    assetUrl: PropTypes.func.isRequired
  },

  render() {
    // In StudioApp.prototype.fixViewportForSmallScreens_ we modify the viewport
    // size manually, assuming we're in landscape mode (which is false when this
    // component is visible). The result was that this container was being
    // stretch to fit an area larger than the screen
    // The fix is to have an outer container that fits that larger area and is
    // just white, with an inner container that stretches to the screen by using
    // viewport units

    return (
      <div id="rotateContainer" style={styles.rotateContainer}>
        <div
          style={{
            ...styles.rotateContainerInner,
            backgroundImage: 'url(' + this.props.assetUrl('media/turnphone_horizontal.png') + ')',
          }}
        >
          <div style={styles.rotateText}>
            <p style={styles.paragraph}>{msg.rotateText()}<br />{msg.orientationLock()}</p>
          </div>
          </div>
      </div>
    );
  },
});
module.exports = RotateContainer;
