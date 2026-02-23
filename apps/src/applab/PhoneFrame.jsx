import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '../legacySharedComponents/FontAwesome';
import {styles as CompletionButtonStyles} from '../templates/CompletionButton';
import {RunButton, ResetButton} from '../templates/GameButtons';
import ProtectedStatefulDiv from '../templates/ProtectedStatefulDiv';

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
  scrollPinHandler = null;
  scrollPinTimeout = null;

  componentDidMount() {
    this.pinScroll(0);
    // Use capture phase to save scroll position BEFORE StudioApp's
    // imperative click handlers modify the DOM and cause scroll shifts.
    this.wrapperRef.current?.addEventListener(
      'click',
      this.onWrapperClick,
      true
    );
  }

  componentWillUnmount() {
    this.clearPin();
    this.wrapperRef.current?.removeEventListener(
      'click',
      this.onWrapperClick,
      true
    );
  }

  onWrapperClick = e => {
    if (e.target.closest('button') && this.wrapperRef.current) {
      this.pinScroll(this.wrapperRef.current.scrollTop);
    }
  };

  // Temporarily pins the wrapper scroll position for 200ms to prevent
  // jumps caused by DOM changes (e.g. resizeVisualization, button toggling).
  pinScroll(target) {
    this.clearPin();
    const wrapper = this.wrapperRef.current;
    if (!wrapper) return;
    wrapper.scrollTop = target;
    this.scrollPinHandler = () => {
      wrapper.scrollTop = target;
    };
    wrapper.addEventListener('scroll', this.scrollPinHandler);
    this.scrollPinTimeout = setTimeout(() => {
      wrapper.removeEventListener('scroll', this.scrollPinHandler);
      this.scrollPinHandler = null;
    }, 200);
  }

  clearPin() {
    if (this.scrollPinTimeout) {
      clearTimeout(this.scrollPinTimeout);
      this.scrollPinTimeout = null;
    }
    if (this.scrollPinHandler && this.wrapperRef.current) {
      this.wrapperRef.current.removeEventListener(
        'scroll',
        this.scrollPinHandler
      );
      this.scrollPinHandler = null;
    }
  }

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
            <ProtectedStatefulDiv className={style.topButtons} canUnmount>
              <RunButton id="topRunButton" />
              <ResetButton id="topResetButton" />
            </ProtectedStatefulDiv>
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
