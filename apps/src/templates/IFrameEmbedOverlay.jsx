import * as color from '../util/color';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {singleton as studioApp} from '../StudioApp';
import msg from '@cdo/locale';

const PHONE_MARGIN = 68;
const PLAY_BUTTON_SIZE = 26;

class IFrameEmbedOverlay extends Component {
  static propTypes = {
    appWidth: PropTypes.number.isRequired,
    appHeight: PropTypes.number.isRequired,
    style: PropTypes.object,
    playButtonStyle: PropTypes.object
  };

  state = {
    tooYoung: false
  };

  static defaultProps = {
    showPlayButton: true
  };

  handleTooYoung = () => {
    this.setState({tooYoung: true});
  };

  onClick = () => {
    if (!this.state.tooYoung) {
      studioApp().startIFrameEmbeddedApp(this.handleTooYoung);
    }
  };

  render() {
    return (
      <div
        style={[
          styles.overlay.wrapper,
          {
            width: this.props.appWidth,
            height: this.props.appHeight
          },
          !this.state.tooYoung && {cursor: 'cursor'},
          this.props.style
        ]}
        onClick={this.onClick}
      >
        {this.state.tooYoung ? (
          <div className="alert alert-danger">{msg.tooYoung()}</div>
        ) : (
          <div>
            <div style={styles.overlay.clickText}>Tap or click to run</div>
            <div
              style={[
                styles.playButtonWrapper,
                {
                  left:
                    this.props.appWidth / 2 -
                    PLAY_BUTTON_SIZE / 2 -
                    styles.playButtonWrapper.padding / 2
                },
                this.props.playButtonStyle
              ]}
            >
              <span className="fa fa-play" style={styles.playButton} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

var styles = {
  overlay: {
    wrapper: {
      position: 'absolute',
      top: PHONE_MARGIN,
      left: 16,
      zIndex: 5,
      textAlign: 'center'
    },
    clickText: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      fontSize: 'x-large',
      color: 'white',
      bottom: 50,
      textShadow:
        '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      cursor: 'default'
    }
  },
  playButtonWrapper: {
    color: 'white',
    position: 'absolute',
    bottom: -PHONE_MARGIN / 2 - PLAY_BUTTON_SIZE / 2 - 5,
    fontSize: 22,
    height: PLAY_BUTTON_SIZE,
    width: PLAY_BUTTON_SIZE,
    lineHeight: `${PLAY_BUTTON_SIZE}px`,
    padding: 7,
    borderRadius: 5,
    backgroundColor: color.dark_charcoal,
    borderColor: color.dark_charcoal,
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: 'pointer',
    ':hover': {
      boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)'
    },
    ':active': {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: '#888'
    }
  },
  playButton: {
    paddingLeft: 4
  }
};

export default Radium(IFrameEmbedOverlay);
