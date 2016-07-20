import React from 'react';
import Radium from 'radium';
import color from '../color';
import applabConstants from './constants';
import experiments from '../experiments';
import ScreenSelector from './ScreenSelector';
import GameButtons, { RunButton, ResetButton } from '../templates/GameButtons';
import CompletionButton from './CompletionButton';
import FontAwesome from '../templates/FontAwesome';

const RADIUS = 30;
const FRAME_HEIGHT = 60;

const styles = {
  phoneFrame: {
    display: 'block',
    height: FRAME_HEIGHT,
    backgroundColor: color.lighter_gray,
  },
  phoneFrameDark: {
    backgroundColor: color.charcoal
  },
  phoneFrameTop: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS,
  },
  phoneFrameBottom: {
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS,
  },
  nonResponsive: {
    maxWidth: applabConstants.APP_WIDTH,
  },
  screenSelector: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: (FRAME_HEIGHT - ScreenSelector.styles.dropdown.height) / 2,
    width: '80%'
  },
  centeredInFrame: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: FRAME_HEIGHT
  },
  paused: {
    color: 'white',
    fontSize: 20
  },
  pauseIcon: {
    marginRight: 5
  },
  buttonMinWidth: {
    minWidth: CompletionButton.styles.phoneFrameButton.minWidth
  }
};


const PhoneFrame = React.createClass({
  propTypes: {
    isDark: React.PropTypes.bool.isRequired,
    screenIds: React.PropTypes.array.isRequired,
    showSelector: React.PropTypes.bool.isRequired,
    isPaused: React.PropTypes.bool.isRequired,
    onScreenCreate: React.PropTypes.func.isRequired,
    children: React.PropTypes.node,
  },

  render: function () {
    const { isDark, screenIds, showSelector, isPaused, onScreenCreate } = this.props;
    return (
      <span id="phoneFrame">
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameTop,
              isDark && styles.phoneFrameDark
            ]}
        >
          {showSelector &&
          <div style={styles.screenSelector}>
            <ScreenSelector
                screenIds={screenIds}
                onCreate={onScreenCreate}
            />
            </div>
          }
          {isPaused &&
          <div style={[styles.centeredInFrame, styles.paused]}>
            <FontAwesome icon="pause" style={styles.pauseIcon}/>
            PAUSED
          </div>
          }
        </div>
        {this.props.children}
        <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameBottom,
              isDark && styles.phoneFrameDark,
            ]}
        >
          <div style={styles.centeredInFrame}>
            <RunButton hidden={false} style={styles.buttonMinWidth}/>
            <ResetButton style={styles.buttonMinWidth}/>
          </div>
        </div>
      </span>
    );
  }
});

export default Radium(PhoneFrame);
