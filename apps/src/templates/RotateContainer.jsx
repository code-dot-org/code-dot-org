import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import _ from 'lodash';

/**
 * "Rotate your device" overlay.
 */
export default class RotateContainer extends React.Component {
  static propTypes = {
    assetUrl: PropTypes.func.isRequired
  };

  state = {
    hasVisualViewport: false
  };

  componentDidMount() {
    if (window.visualViewport) {
      this.updateViewport();

      this.resizeListener = _.throttle(this.updateViewport, 200);
      window.visualViewport.addEventListener('resize', this.resizeListener);
      window.visualViewport.addEventListener('scroll', this.resizeListener);
    }
  }

  updateViewport = () => {
    this.setState({
      hasVisualViewport: true,
      offsetLeft: window.visualViewport.offsetLeft,
      offsetTop: window.visualViewport.offsetTop,
      width: window.visualViewport.width,
      height: window.visualViewport.height
    });
  };

  render() {
    // Duplicate the default styles in case we want to modify any.
    let rotateContainerInnerStyle = {
      ...styles.rotateContainerInner,
      backgroundImage:
        'url(' + this.props.assetUrl('media/turnphone_horizontal.png') + ')'
    };
    let rotateTextStyle = {...styles.rotateText};
    let paragraphStyle = {...styles.paragraph};

    // Override the defaults if the browser supports window.visualViewport.
    if (this.state.hasVisualViewport) {
      const width = this.state.width;
      const height = this.state.height;
      const offsetLeft = this.state.offsetLeft;
      const offsetTop = this.state.offsetTop;
      const textLeft = width * -0.4;
      const textTop = height / 2;
      const fontSize = width / 25;

      rotateContainerInnerStyle = {
        ...rotateContainerInnerStyle,
        width: width,
        height: height,
        left: offsetLeft,
        top: offsetTop
      };

      rotateTextStyle = {
        ...rotateTextStyle,
        left: textLeft,
        top: textTop
      };

      paragraphStyle = {
        ...paragraphStyle,
        fontSize: fontSize
      };
    }

    return (
      <div id="rotateContainer" style={styles.rotateContainer}>
        <div id="rotateContainerInner" style={rotateContainerInnerStyle}>
          <div id="rotateText" style={rotateTextStyle}>
            <p style={paragraphStyle}>
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
    position: 'absolute',
    backgroundPosition: '50% 50%',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    width: '100%',
    height: '100%'
  },
  rotateText: {
    position: 'relative',
    top: '50%',
    left: '-40%'
  },
  paragraph: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 1.5,
    transform: 'rotate(90deg)'
  }
};
