import * as color from '../color';
import React from 'react';
var Radium = require('radium');
var studioApp = require('../StudioApp').singleton;
var applabConstants = require('./constants');
var msg = require('../locale');

const PHONE_MARGIN = 68;

var styles = {
  overlay: {
    wrapper: {
      position: 'absolute',
      top: PHONE_MARGIN,
      left: 16,
      width: applabConstants.APP_WIDTH,
      height: applabConstants.APP_HEIGHT,
      zIndex: 5,
      textAlign: 'center',
    },
    clickText: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      fontSize: 'x-large',
      color: 'white',
      bottom: 50,
      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      cursor: 'default',
    },
  },
  playButtonWrapper: {
    color: 'white',
    position: 'absolute',
    bottom: -PHONE_MARGIN/2 - 26/2 - 5,
    left: applabConstants.APP_WIDTH/2 - 26/2 - 7/2,
    fontSize: 22,
    height: 26,
    width: 26,
    lineHeight: '26px',
    padding: 7,
    borderRadius: 5,
    backgroundColor: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    ':hover': {
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
    },
    ':active': {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#888',
    },
  },
  playButton: {
    paddingLeft: 4,
  },
};

var IFrameEmbedOverlay = React.createClass({

  getInitialState() {
    return {
      tooYoung: false
    };
  },

  handleTooYoung() {
    this.setState({tooYoung: true});
  },

  onClick() {
    if (!this.state.tooYoung) {
      studioApp.startIFrameEmbeddedApp(this.handleTooYoung);
    }
  },

  render() {
    return (
      <div style={[styles.overlay.wrapper, !this.state.tooYoung && {cursor: 'cursor'}]}
           onClick={this.onClick}>
        {
          this.state.tooYoung ?
          <div className="alert alert-danger">
            {window.dashboard.i18n.t('errors.messages.too_young')}
          </div> :
          <div>
            <div style={styles.overlay.clickText}>Tap or click to run</div>
            <div style={styles.playButtonWrapper}>
              <span className="fa fa-play" style={styles.playButton} />
            </div>
          </div>
        }
      </div>
    );
  },
});

export default Radium(IFrameEmbedOverlay);
