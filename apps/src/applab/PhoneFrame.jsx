import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../util/color';
import ScreenSelector, {styles as ScreenSelectorStyles} from './ScreenSelector';
import {RunButton, ResetButton} from '../templates/GameButtons';
import {styles as CompletionButtonStyles} from '../templates/CompletionButton';
import FontAwesome from '../templates/FontAwesome';

const RADIUS = 30;
const FRAME_HEIGHT = 60;

class PhoneFrame extends React.Component {
  static propTypes = {
    isDark: PropTypes.bool.isRequired,
    screenIds: PropTypes.array.isRequired,
    showSelector: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired,
    onScreenCreate: PropTypes.func.isRequired,
    children: PropTypes.node
  };

  render() {
    const {
      isDark,
      screenIds,
      showSelector,
      isPaused,
      onScreenCreate
    } = this.props;
    return (
      <span id="phoneFrame">
        <div id="phoneFrameWrapper">
          <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameTop,
              isDark && styles.phoneFrameDark
            ]}
          >
            {showSelector && (
              <div style={styles.screenSelector}>
                <ScreenSelector
                  screenIds={screenIds}
                  onCreate={onScreenCreate}
                />
              </div>
            )}
            {isPaused && (
              <div style={[styles.centeredInFrame, styles.paused]}>
                <FontAwesome icon="pause" style={styles.pauseIcon} />
                PAUSED
              </div>
            )}
          </div>
          {this.props.children}
          <div
            style={[
              styles.phoneFrame,
              styles.phoneFrameBottom,
              isDark && styles.phoneFrameDark
            ]}
          >
            <div style={styles.centeredInFrame}>
              <RunButton hidden={false} style={styles.buttonMinWidth} />
              <ResetButton style={styles.buttonMinWidth} />
            </div>
          </div>
        </div>
      </span>
    );
  }
}

const styles = {
  phoneFrame: {
    display: 'block',
    height: FRAME_HEIGHT,
    backgroundColor: color.lighter_gray
  },
  phoneFrameDark: {
    backgroundColor: color.charcoal
  },
  phoneFrameTop: {
    borderTopLeftRadius: RADIUS,
    borderTopRightRadius: RADIUS
  },
  phoneFrameBottom: {
    borderBottomLeftRadius: RADIUS,
    borderBottomRightRadius: RADIUS
  },
  screenSelector: {
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingTop: (FRAME_HEIGHT - ScreenSelectorStyles.dropdown.height) / 2,
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
    minWidth: CompletionButtonStyles.phoneFrameButton.minWidth
  }
};

export default Radium(PhoneFrame);
