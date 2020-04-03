import PropTypes from 'prop-types';
import React from 'react';
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
    height: '100%'
  },
  rotateContainerInner: {
    backgroundPosition: '50% 10%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat'
  },
  rotateText: {
    position: 'relative',
    top: '25%',
    left: '-50%',
    marginLeft: '50px',
    marginRight: '-50px'
  },
  paragraph: {
    textAlign: 'center',
    fontSize: 48,
    lineHeight: 1.5,
    transform: 'translate(40px, 0px) rotate(90deg)'
  }
};

/**
 * "Rotate your device" overlay.
 */
export default class RotateContainer extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired,
    width: PropTypes.number
  };

  render() {
    let width, height;
    if (this.props.width) {
      width = this.props.width;
      height = '100%';
    } else {
      width = '90%';
      height = '100%';
    }

    return (
      <div id="rotateContainer" style={styles.rotateContainer}>
        <div
          style={{
            ...styles.rotateContainerInner,
            width: width,
            height: height,
            backgroundImage:
              'url(' +
              this.props.assetUrl('media/turnphone_horizontal.png') +
              ')'
          }}
        >
          <div style={styles.rotateText}>
            <p style={styles.paragraph}>
              {msg.rotateText()}
              <br />
              {msg.orientationLock()}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
