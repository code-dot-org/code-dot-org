import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../legacySharedComponents/FontAwesome';
import {singleton as studioApp} from '../StudioApp';
import {styles as CompletionButtonStyles} from '../templates/CompletionButton';
import {RunButton, ResetButton} from '../templates/GameButtons';

import ScreenSelector from './ScreenSelector';

import style from './phone-frame.module.scss';

export default class PhoneFrame extends React.Component {
  static propTypes = {
    isDark: PropTypes.bool.isRequired,
    screenIds: PropTypes.array.isRequired,
    showSelector: PropTypes.bool.isRequired,
    isPaused: PropTypes.bool.isRequired,
    onScreenCreate: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  render() {
    const {isDark, screenIds, showSelector, isPaused, onScreenCreate} =
      this.props;
    return (
      <span id="phoneFrame">
        <div id="phoneFrameWrapper" className={style.phoneFrameWrapper}>
          <div
            className={classNames(
              style.phoneFrame,
              style.phoneFrameTop,
              isDark && style.phoneFrameDark
            )}
          >
            {showSelector && (
              <div className={style.screenSelector}>
                <ScreenSelector
                  screenIds={screenIds}
                  onCreate={onScreenCreate}
                />
              </div>
            )}
            {isPaused && (
              <div className={classNames(style.centeredInFrame, style.paused)}>
                <FontAwesome icon="pause" className={style.pauseIcon} />
                PAUSED
              </div>
            )}
            <div className={style.topButtons}>
              {isDark ? (
                <button
                  type="button"
                  className={style.topResetButton}
                  onClick={() => studioApp().resetButtonClick()}
                  aria-label="Reset"
                  title="Reset"
                >
                  <FontAwesome icon="repeat" />
                </button>
              ) : (
                <button
                  type="button"
                  className={style.topRunButton}
                  onClick={() => studioApp().runButtonClick()}
                >
                  <FontAwesome icon="play" /> Run
                </button>
              )}
            </div>
          </div>
          {this.props.children}
          <div
            className={classNames(
              style.phoneFrame,
              style.phoneFrameBottom,
              isDark && style.phoneFrameDark
            )}
          >
            <div className={style.centeredInFrame}>
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
  buttonMinWidth: {
    minWidth: CompletionButtonStyles.phoneFrameButton.minWidth,
  },
};
