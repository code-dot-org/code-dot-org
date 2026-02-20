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

  wrapperRef = React.createRef();

  preserveScroll = callback => {
    const wrapper = this.wrapperRef.current;
    if (!wrapper) {
      callback();
      return;
    }
    const scrollTop = wrapper.scrollTop;
    callback();
    wrapper.scrollTop = scrollTop;
    requestAnimationFrame(() => {
      wrapper.scrollTop = scrollTop;
    });
  };

  handleRunClick = () => {
    this.preserveScroll(() => studioApp().runButtonClick());
  };

  handleResetClick = () => {
    this.preserveScroll(() => studioApp().resetButtonClick());
  };

  render() {
    const {isDark, screenIds, showSelector, isPaused, onScreenCreate} =
      this.props;
    return (
      <span id="phoneFrame">
        <div
          id="phoneFrameWrapper"
          ref={this.wrapperRef}
          className={style.phoneFrameWrapper}
        >
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
              <RunButton
                id="topRunButton"
                hidden={isDark}
                onClick={this.handleRunClick}
              />
              <ResetButton
                id="topResetButton"
                style={isDark ? {display: 'inline-block'} : {}}
                onClick={this.handleResetClick}
              />
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
