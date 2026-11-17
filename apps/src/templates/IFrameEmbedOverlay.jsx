import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import msg from '@cdo/locale';

import {singleton as studioApp} from '../StudioApp';

const PHONE_MARGIN = 68;
const OVERLAY_LEFT = 16;
// The medium MUI IconButton.
const PLAY_BUTTON_SIZE = 40;

// Centers the play button in the phone frame's bottom margin, measured from
// the overlay's top left corner.
function playButtonOffset(appWidth, appHeight) {
  return {
    top: appHeight + PHONE_MARGIN / 2 - PLAY_BUTTON_SIZE / 2,
    left: appWidth / 2 - PLAY_BUTTON_SIZE / 2,
  };
}

/**
 * Position, in the overlay's containing block, of the play button. App Lab's
 * embed reset button takes this spot once the app runs.
 */
export function playButtonPosition(appWidth, appHeight) {
  const {top, left} = playButtonOffset(appWidth, appHeight);
  return {
    ...styles.playButton,
    top: PHONE_MARGIN + top,
    left: OVERLAY_LEFT + left,
  };
}

class IFrameEmbedOverlay extends Component {
  static propTypes = {
    appWidth: PropTypes.number.isRequired,
    appHeight: PropTypes.number.isRequired,
    style: PropTypes.object,
    playButtonStyle: PropTypes.object,
  };

  state = {
    tooYoung: false,
  };

  static defaultProps = {
    showPlayButton: true,
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
        style={{
          ...styles.overlay.wrapper,
          width: this.props.appWidth,
          height: this.props.appHeight,
          ...(!this.state.tooYoung && {cursor: 'cursor'}),
          ...this.props.style,
        }}
        onClick={this.onClick}
      >
        {this.state.tooYoung ? (
          <div className="alert alert-danger">{msg.tooYoung()}</div>
        ) : (
          <div>
            <div style={styles.overlay.clickText}>Tap or click to run</div>
            <MuiIconButton
              variant="contained"
              color="secondary"
              size="medium"
              aria-label={msg.runProgram()}
              style={{
                ...styles.playButton,
                ...playButtonOffset(this.props.appWidth, this.props.appHeight),
                ...this.props.playButtonStyle,
              }}
            >
              <FontAwesomeV6Icon iconName="play" iconStyle="solid" />
            </MuiIconButton>
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
      left: OVERLAY_LEFT,
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
      textShadow:
        '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      cursor: 'default',
    },
  },
  playButton: {
    position: 'absolute',
    width: PLAY_BUTTON_SIZE,
    height: PLAY_BUTTON_SIZE,
  },
};

export default IFrameEmbedOverlay;
