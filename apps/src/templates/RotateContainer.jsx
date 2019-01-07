import React, {PropTypes} from 'react';
import msg from '@cdo/locale';

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
export default class RotateContainer extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired
  };

  render() {
    // In StudioApp.prototype.fixViewportForSmallScreens_ we end up scaling our
    // viewport so that things look good in landscape mode. Unfortunately, this
    // means that we can't dependably use CSS to size our rotate container in a
    // way that works across ios and android.
    // What we do is to figure out the scaling factor fixViewportForSmallScreens_
    // is going to use and set our width relative to that factor.
    // In addition, I've added an outer container that fills up the whole space
    // with a white background, so that if you scroll off of the inner container
    // you see white instead of the codeApp

    const scale = screen.height / 900;

    return (
      <div id="rotateContainer" style={styles.rotateContainer}>
        <div
          style={{
            ...styles.rotateContainerInner,
            width: window.screen.width / scale,
            height: window.screen.height,
            backgroundImage: 'url(' + this.props.assetUrl('media/turnphone_horizontal.png') + ')',
          }}
        >
          <div style={styles.rotateText}>
            <p style={styles.paragraph}>{msg.rotateText()}<br />{msg.orientationLock()}</p>
          </div>
          </div>
      </div>
    );
  }
}
