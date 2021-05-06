import React from 'react';
import i18n from '@cdo/locale';
import color from '../util/color';
import trackEvent from '../util/trackEvent';
import _ from 'lodash';

/**
 * If the browser supports window.visualViewport, and we detect that the user
 * is zoomed in, first show a small button in the bottom-right of the viewport.
 * If pressed, a semi-transparent overlay is shown, which will also send touch
 * events to the browser itself so that the user can pinch-to-zoom back to
 * normal.  If the user fully zooms out, or taps once to dismiss, then the
 * overlay will be hidden again.
 */
export default class FixZoomHelper extends React.Component {
  // mode can be "none", "button", or "helper".
  state = {
    mode: 'none'
  };

  isLandscape() {
    return window.matchMedia('(orientation: landscape)').matches;
  }

  isZoomed() {
    return (
      Math.abs(document.body.offsetWidth - window.visualViewport.width) > 30
    );
  }

  updateViewport = () => {
    const isZoomed = this.isZoomed();

    if (this.state.mode !== 'none' && !isZoomed) {
      const lastMode = this.state.mode;

      // If transitioning from zoomed to non-zoomed, then mode goes to "none".
      this.setState({mode: 'none'});

      trackEvent('Research', 'FixZoomHelper', `${lastMode}-to-none`);
    } else if (this.state.mode === 'none' && isZoomed) {
      // If transitioning from non-zoomed to zoomed, then mode goes to "button".
      this.setState({mode: 'button'});

      trackEvent('Research', 'FixZoomHelper', 'none-to-button');
    }

    // Also update the viewport information.
    if (window.visualViewport) {
      this.setState({
        offsetLeft: window.visualViewport.offsetLeft,
        offsetTop: window.visualViewport.offsetTop,
        width: window.visualViewport.width,
        height: window.visualViewport.height
      });
    }
  };

  componentDidMount() {
    // This component does nothing without visual viewport support.
    if (window.visualViewport) {
      this.updateViewport();

      this.resizeListener = _.throttle(this.updateViewport, 200);
      window.visualViewport.addEventListener('resize', this.resizeListener);
      window.visualViewport.addEventListener('scroll', this.resizeListener);
    }
  }

  componentWillUnmount() {
    if (window.visualViewport) {
      document.removeEventListener('resize', this.resizeListener, false);
      document.removeEventListener('scroll', this.resizeListener, false);
    }
  }

  onButtonClick = () => {
    this.setState({mode: 'helper'});

    trackEvent('Research', 'FixZoomHelper', 'button-to-helper');
  };

  onHelperClick = () => {
    this.setState({mode: 'button'});

    trackEvent('Research', 'FixZoomHelper', 'helper-to-button');
  };

  render() {
    const {offsetTop, offsetLeft, height, width, mode} = this.state;

    if (mode === 'button') {
      const top = offsetTop + height - 10;
      const left = offsetLeft + width - 10;

      return (
        <div onClick={this.onButtonClick} style={{...styles.button, top, left}}>
          <div style={styles.buttonIcon}>
            <span style={styles.icon} className="fa fa-search-minus" />
            &nbsp;
          </div>
          <div style={styles.buttonText}>{i18n.fixZoomHelperZoomOut()}</div>
        </div>
      );
    } else if (mode === 'helper') {
      const top = offsetTop + height / 2;
      const left = offsetLeft + width / 2;

      return (
        <div>
          <div onClick={this.onHelperClick} style={styles.helper} />
          <div style={{...styles.helperInner, top, left}}>
            <div style={styles.helperInnerIcons}>
              <span className="fa fa-arrow-circle-o-right" />
              &nbsp;
              <span className="fa fa-arrow-circle-o-left" />
            </div>
            {i18n.fixZoomHelperPinch()}
            <br />
            {i18n.fixZoomHelperDismiss()}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

const styles = {
  button: {
    position: 'fixed',
    zIndex: 9999,
    opacity: 0.8,
    color: color.white,
    backgroundColor: color.black,
    borderRadius: 4,
    padding: 15,
    transform: 'translate(-100%,-100%)',
    whiteSpace: 'nowrap',
    cursor: 'pointer'
  },
  buttonIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    fontSize: 24
  },
  buttonText: {
    display: 'inline-block',
    verticalAlign: 'middle',
    paddingTop: 5
  },
  helper: {
    position: 'fixed',
    zIndex: 9998,
    backgroundColor: 'white',
    opacity: 0.8,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%'
  },
  helperInner: {
    position: 'fixed',
    zIndex: 9999,
    transform: 'translate(-50%,-50%)',
    color: color.white,
    backgroundColor: color.black,
    opacity: 0.8,
    padding: 15,
    borderRadius: 5,
    textAlign: 'center',
    pointerEvents: 'none'
  },
  helperInnerIcons: {
    fontSize: 24,
    marginBottom: 10
  },
  closeX: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 13
  }
};
