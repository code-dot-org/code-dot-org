/**
 * A React component for our JavaScript debugger UI. Returns a connected component
 * so this can only be used in cases where we have a redux store.
 */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import classNames from 'classnames';
import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import dom from '../../../dom';
import {setStepSpeed, setIsDebuggingSprites} from '../../../redux/runState';
import {
  add as addWatchExpression,
  remove as removeWatchExpression,
} from '../../../redux/watchedExpressions';
import PaneHeader, {
  PaneSection,
  PaneButton,
} from '../../../templates/PaneHeader';
import SpeedSlider from '../../../templates/SpeedSlider';
import * as utils from '../../../utils';

import DebugButtons from './DebugButtons';
import DebugConsole from './DebugConsole';
import {
  // actions
  clearLog,
  open,
  close,

  // selectors
  isAttached,
  isOpen,
  canRunNext,
  getCommandHistory,
} from './redux';
import Watchers from './Watchers';

import styles from './js-debugger.module.scss';
import commonStyles from '../../../common-styles.module.scss';

const debugAreaTransitionValue = 'height 0.4s';

const MIN_DEBUG_AREA_HEIGHT = 120;
const MAX_DEBUG_AREA_HEIGHT = 400;
const MIN_WATCHERS_AREA_WIDTH = 120;
const MAX_WATCHERS_AREA_WIDTH = 400;
const MIN_CONSOLE_WIDTH = 345;

/**
 * The parent JsDebugger component.
 */
class JsDebugger extends React.Component {
  static propTypes = {
    // from redux
    debugButtons: PropTypes.bool.isRequired,
    debugConsole: PropTypes.bool.isRequired,
    debugWatch: PropTypes.bool.isRequired,
    debugSlider: PropTypes.bool.isRequired,
    debugConsoleDisabled: PropTypes.bool.isRequired,
    appType: PropTypes.string.isRequired,
    isDebuggerPaused: PropTypes.bool.isRequired,
    isDebuggingSprites: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    isEditWhileRun: PropTypes.bool.isRequired,
    stepSpeed: PropTypes.number.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isAttached: PropTypes.bool.isRequired,
    canRunNext: PropTypes.bool.isRequired,
    setStepSpeed: PropTypes.func.isRequired,
    setIsDebuggingSprites: PropTypes.func.isRequired,
    clearLog: PropTypes.func.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,

    // passed from above
    onSlideShut: PropTypes.func,
    onSlideOpen: PropTypes.func,
    style: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      watchersHidden: false,
      open: props.isOpen,
      openedHeight: 120,
      consoleWidth: 0,
      // For Google Analytics to see if student has opened the debugger
      userInteracted: false,
    };
  }

  handleResizeConsole = () => {
    let debuggerWidth = 0;
    if (document.getElementById('debug-area-header')) {
      debuggerWidth = document.getElementById('debug-area-header').offsetWidth;
    }
    let commandsWidth = 0;
    if (document.getElementById('debug-commands-header')) {
      commandsWidth = document.getElementById(
        'debug-commands-header'
      ).offsetWidth;
    }
    let watchersWidth = 0;
    if (document.getElementById('debug-watch-header')) {
      watchersWidth = document.getElementById('debug-watch-header').offsetWidth;
    }
    const consoleWidth = debuggerWidth - commandsWidth - watchersWidth;
    this.setState({consoleWidth});
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResizeConsole);

    this.props.setStepSpeed(this.props.stepSpeed);
    if (this.props.isOpen) {
      this.slideOpen();
    }

    const mouseUpTouchEventName = dom.getTouchEventName('mouseup');

    // Attach handlers for the debug area resize control
    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup', this.onMouseUpDebugResizeBar);
    if (mouseUpTouchEventName) {
      document.body.addEventListener(
        mouseUpTouchEventName,
        this.onMouseUpDebugResizeBar
      );
    }

    // Can't use dom.addMouseUpTouchEvent() because it will preventDefault on
    // all touchend events on the page, breaking click events...
    document.body.addEventListener('mouseup', this.onMouseUpWatchersResizeBar);
    if (mouseUpTouchEventName) {
      document.body.addEventListener(
        mouseUpTouchEventName,
        this.onMouseUpWatchersResizeBar
      );
    }

    let watchersReferences = {};
    function getWatchersElements() {
      watchersReferences.watchersResizeBar =
        watchersReferences.watchersResizeBar ||
        document.getElementById('watchersResizeBar');
      watchersReferences.watchersDiv =
        watchersReferences.watchersDiv ||
        document.getElementById('debug-watch');
      watchersReferences.watchersHeaderDiv =
        watchersReferences.watchersHeaderDiv ||
        document.getElementById('debug-watch-header');
      watchersReferences.debugConsoleDiv =
        watchersReferences.debugConsoleDiv ||
        document.getElementById('debug-console');
      return watchersReferences;
    }

    document.addEventListener('resetWatchersResizableElements', () => {
      const elements = getWatchersElements();
      elements.watchersDiv.style.removeProperty('width');
      elements.debugConsoleDiv.style.removeProperty('right');
      elements.watchersResizeBar.style.removeProperty('right');
      elements.watchersHeaderDiv.style.removeProperty('width');

      this.handleResizeConsole();

      watchersReferences = {};
    });
  }

  componentWillUnmount() {
    this.onMouseUpWatchersResizeBar();
    this.onMouseUpDebugResizeBar();

    const mouseUpTouchEventName = dom.getTouchEventName('mouseup');

    document.body.removeEventListener(
      'mouseup',
      this.onMouseUpWatchersResizeBar
    );
    if (mouseUpTouchEventName) {
      document.body.removeEventListener(
        mouseUpTouchEventName,
        this.onMouseUpWatchersResizeBar
      );
    }

    document.body.removeEventListener('mouseup', this.onMouseUpDebugResizeBar);
    if (mouseUpTouchEventName) {
      document.body.removeEventListener(
        mouseUpTouchEventName,
        this.onMouseUpDebugResizeBar
      );
    }

    window.removeEventListener('resize', this.handleResizeConsole);
  }

  onMouseUpDebugResizeBar = () => {
    if (this.props.debugButtons) {
      this.setState({userInteracted: true});
    }
    // If we have been tracking mouse moves, remove the handler now:
    if (this._draggingDebugResizeBar) {
      document.body.removeEventListener(
        'mousemove',
        this.onMouseMoveDebugResizeBar
      );
      const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
      if (mouseMoveTouchEventName) {
        document.body.removeEventListener(
          mouseMoveTouchEventName,
          this.onMouseMoveDebugResizeBar
        );
      }
      this._draggingDebugResizeBar = false;
    }
  };

  slideShut() {
    const closedHeight =
      $(this.root).find('#debug-area-header').height() +
      $(this._debugResizeBar).height();
    this.setState({
      transitionType: 'closing',
      open: false,
      openedHeight: $(this.root).height(),
      closedHeight,
    });
    this.props.onSlideShut && this.props.onSlideShut(closedHeight);
  }

  slideOpen() {
    this.setState({
      open: true,
      transitionType: 'opening',
    });
    this.props.onSlideOpen && this.props.onSlideOpen(this.state.openedHeight);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      this.slideShut();
    } else if (!this.props.isOpen && nextProps.isOpen) {
      this.slideOpen();
    }
  }

  slideToggle = () => {
    if (this.props.isOpen) {
      this.props.close();
    } else {
      if (this.props.debugButtons) {
        this.setState({userInteracted: true});
      }
      this.props.open();
    }
  };

  onTransitionEnd = () => this.setState({transitionType: null});

  onMouseDownDebugResizeBar = event => {
    this._draggingDebugResizeBar = true;
    document.body.addEventListener('mousemove', this.onMouseMoveDebugResizeBar);
    const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
    if (mouseMoveTouchEventName) {
      document.body.addEventListener(
        mouseMoveTouchEventName,
        this.onMouseMoveDebugResizeBar
      );
    }

    event.preventDefault();
  };

  setDebugHeight = height => {
    if (!this.props.isOpen) {
      this.props.open();
      this.setState({
        open: true,
        openedHeight: height,
      });
    } else {
      this.setState({
        openedHeight: height,
      });
    }
  };

  /**
   *  Handle mouse moves while dragging the debug resize bar.
   */
  onMouseMoveDebugResizeBar = event => {
    const codeApp = document.getElementById('codeApp');
    const codeTextbox = document.getElementById('codeTextbox');
    if (!codeApp || !codeTextbox) {
      // In unit tests this handler may be triggered outside its normal
      // context, where codeApp and codeTextbox don't exist.  Also, this
      // component isn't cleaning up mouse handlers particularly well.
      // TODO: Add a componentWillUnmount method that cleans up all mouse handlers
      return;
    }

    const resizeBar = this._debugResizeBar;
    const rect = resizeBar.getBoundingClientRect();
    const offset =
      (parseInt(window.getComputedStyle(codeApp).bottom, 10) || 0) -
      rect.height / 2;
    const newDbgHeight = Math.max(
      MIN_DEBUG_AREA_HEIGHT,
      Math.min(MAX_DEBUG_AREA_HEIGHT, window.innerHeight - event.pageY - offset)
    );

    this.setDebugHeight(newDbgHeight);

    codeTextbox.style.bottom = newDbgHeight + 'px';
    // Toggle transition style to 'none' to allow height to update immediately
    this.root.style.transition = 'none';
    this.root.style.height = newDbgHeight + 'px';
    // Force reference to offsetHeight, to trigger a reflow and make the browser
    // pick up the CSS changes immediately. see https://stackoverflow.com/a/16575811
    this.root.offsetHeight;
    this.root.style.transition = debugAreaTransitionValue;

    this.handleResizeConsole();

    // Fire resize so blockly and droplet handle this type of resize properly:
    utils.fireResizeEvent();
  };

  onMouseDownWatchersResizeBar = event => {
    this._draggingWatchersResizeBar = true;
    document.body.addEventListener(
      'mousemove',
      this.onMouseMoveWatchersResizeBar
    );
    const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
    if (mouseMoveTouchEventName) {
      document.body.addEventListener(
        mouseMoveTouchEventName,
        this.onMouseMoveWatchersResizeBar
      );
    }

    event.preventDefault();
  };

  onMouseUpWatchersResizeBar = () => {
    // If we have been tracking mouse moves, remove the handler now:
    if (this._draggingWatchersResizeBar) {
      document.body.removeEventListener(
        'mousemove',
        this.onMouseMoveWatchersResizeBar
      );
      const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
      if (mouseMoveTouchEventName) {
        document.body.removeEventListener(
          mouseMoveTouchEventName,
          this.onMouseMoveWatchersResizeBar
        );
      }
      this._draggingWatchersResizeBar = false;
    }
  };

  /**
   *  Handle mouse moves while dragging the debug resize bar.
   */
  onMouseMoveWatchersResizeBar = event => {
    const watchersRect =
      this._watchers.scrollableContainer.getBoundingClientRect();
    const movement = watchersRect.left - event.clientX;
    const newDesiredWidth = watchersRect.width + movement;
    const newWatchersWidth = Math.max(
      MIN_WATCHERS_AREA_WIDTH,
      Math.min(MAX_WATCHERS_AREA_WIDTH, newDesiredWidth)
    );

    const watchersResizeRect = this._watchersResizeBar.getBoundingClientRect();
    const watchersResizeRight = newWatchersWidth - watchersResizeRect.width / 2;
    this._watchers.scrollableContainer.style.width = newWatchersWidth + 'px';
    this._debugConsole.root.style.right = newWatchersWidth + 'px';
    this._watchersResizeBar.style.right = watchersResizeRight + 'px';

    this._debugWatchHeader.style.width = newWatchersWidth - 3 + 'px';

    this.handleResizeConsole();
  };

  onClearDebugOutput = () => this.props.clearLog();

  onToggleDebugSprites = () => {
    this.props.setIsDebuggingSprites(!this.props.isDebuggingSprites);
  };

  render() {
    const {appType, isAttached, canRunNext, isRunning, debugButtons} =
      this.props;
    const hasFocus = this.props.isDebuggerPaused && !this.props.isEditWhileRun;

    const canShowDebugSprites = appType === 'gamelab';

    const openStyle = {};
    if (!this.state.open && this.state.transitionType !== 'closing') {
      openStyle.display = 'none';
    }
    let height = this.state.open
      ? this.state.openedHeight
      : this.state.closedHeight;
    if (!height && this.props.style) {
      height = this.props.style.height;
    }

    const showWatchPane = this.props.debugWatch && !this.state.watchersHidden;
    return (
      <div
        id="debug-area"
        style={{
          transition: debugAreaTransitionValue,
          ...this.props.style,
          height,
        }}
        onTransitionEnd={this.onTransitionEnd}
        ref={root => (this.root = root)}
      >
        <div
          id="debugResizeBar"
          onMouseDown={this.onMouseDownDebugResizeBar}
          ref={debugResizeBar => (this._debugResizeBar = debugResizeBar)}
        >
          <i className="fa-solid fa-ellipsis" />
        </div>
        <PaneHeader id="debug-area-header" className={styles.debugAreaHeader}>
          <PaneSection
            id="debug-commands-header"
            style={{
              alignItems: 'center',
              flex: '0 0 271px',
              gap: '0.5rem',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              width: 271,
              height: 30,
              borderRight: '1px solid var(--borders-neutral-strong)',
            }}
          >
            <MuiIconButton
              type="button"
              variant="outlined"
              color="secondary"
              size="extraSmall"
              id="show-toolbox-icon"
              className="show-toolbox-icon"
              onClick={this.slideToggle}
              aria-label={i18n.debugArea()}
              aria-expanded={this.state.open}
              aria-controls="debug-area"
              sx={{
                borderRadius: '50%',
                height: '1rem',
                width: '1rem',
              }}
            >
              <FontAwesomeV6Icon
                iconName={this.state.open ? 'chevron-down' : 'chevron-up'}
                iconStyle="solid"
              />
            </MuiIconButton>
            {this.props.debugButtons && (
              <MuiTypography
                className={styles.noUserSelect}
                variant="body4"
                id="workspace-header-span"
                sx={{
                  color: 'var(--text-neutral-white-fixed)',
                  flex: '1 1 0',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  display: 'flex',
                }}
              >
                <FontAwesomeV6Icon
                  iconName="spinner"
                  iconStyle="solid"
                  animationType="spin"
                  className={classNames(
                    (!isAttached || canRunNext) && commonStyles.hidden
                  )}
                />
                <FontAwesomeV6Icon
                  iconName="pause"
                  iconStyle="solid"
                  className={classNames(
                    (!isAttached || !canRunNext) && commonStyles.hidden
                  )}
                />
                {this.state.open
                  ? i18n.debugCommandsHeaderWhenOpen()
                  : i18n.debugCommandsHeaderWhenClosed()}
              </MuiTypography>
            )}
          </PaneSection>
          <PaneSection
            id="debug-console-header"
            style={{
              alignItems: 'center',
              flex: '1 1 0',
              gap: '0.5rem',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              height: 30,
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              borderRight: '1px solid var(--borders-neutral-strong)',
              overflow: 'hidden',
            }}
          >
            {isRunning && canShowDebugSprites && (
              <PaneButton
                iconProps={{iconName: 'bug', iconStyle: 'solid'}}
                label={i18n.debugSpritesOff()}
                headerHasFocus={hasFocus}
                isRtl={false}
                isPressed={this.props.isDebuggingSprites}
                pressedLabel={i18n.debugSpritesOn()}
                onClick={this.onToggleDebugSprites}
              />
            )}
            {this.props.debugSlider && (
              <SpeedSlider
                className={debugButtons ? styles.sliderDebug : styles.slider}
                hasFocus={hasFocus}
                value={this.props.stepSpeed}
                lineWidth={130}
                onChange={this.props.setStepSpeed}
              />
            )}
            <MuiTypography
              className={classNames(
                this.state.consoleWidth <= MIN_CONSOLE_WIDTH && styles.hidden,
                styles.noUserSelect
              )}
              variant="body4"
              id="debug-console-header-span"
              sx={{
                color: 'var(--text-neutral-white-fixed)',
                flex: '1 1 0',
                gap: '0.5rem',
                display: 'flex',
              }}
            >
              {i18n.debugConsoleHeader()}
            </MuiTypography>
            <PaneButton
              id="clear-console-header"
              iconProps={{iconName: 'eraser', iconStyle: 'solid'}}
              label={i18n.debugClearButton()}
              headerHasFocus={hasFocus}
              isRtl={false}
              onClick={this.onClearDebugOutput}
            />
          </PaneSection>
          {this.props.debugWatch && (
            <PaneSection
              id="debug-watch-header"
              ref={debugWatchHeader =>
                (this._debugWatchHeader = debugWatchHeader)
              }
              style={{
                alignItems: 'center',
                gap: '0.5rem',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                paddingLeft: '0.5rem',
                paddingRight: '0.5rem',
                height: 30,
              }}
              className={classNames(
                styles.debugWatchHeader,
                this.state.watchersHidden && styles.watchersHidden
              )}
            >
              <MuiTypography
                className={styles.noUserSelect}
                variant="body4"
                id="watcher-header-span"
                sx={{
                  color: 'var(--text-neutral-white-fixed)',
                  flex: '1 1 100%',
                  justifyContent: this.state.watchersHidden
                    ? 'flex-end'
                    : 'center',
                  gap: '0.5rem',
                  display: 'flex',
                }}
              >
                {this.state.watchersHidden
                  ? i18n.debugShowWatchHeader()
                  : i18n.debugWatchHeader()}
              </MuiTypography>
              <MuiIconButton
                type="button"
                variant="outlined"
                color="secondary"
                size="extraSmall"
                onClick={() => {
                  // reset resizer-overridden styles
                  // (remove once resize logic migrated to React)
                  if (!this.state.watchersHidden) {
                    const resetResizeEvent = document.createEvent('Event');
                    resetResizeEvent.initEvent(
                      'resetWatchersResizableElements',
                      true,
                      true
                    );
                    document.dispatchEvent(resetResizeEvent);
                  }
                  this.setState({watchersHidden: !this.state.watchersHidden});
                }}
                aria-label={i18n.debugWatchHeader()}
                aria-expanded={!this.state.watchersHidden}
                aria-controls="debug-watch"
                sx={{
                  borderRadius: '50%',
                  height: '1rem',
                  width: '1rem',
                }}
              >
                <FontAwesomeV6Icon
                  iconName={
                    this.state.watchersHidden ? 'chevron-left' : 'chevron-right'
                  }
                  iconStyle="solid"
                />
              </MuiIconButton>
            </PaneSection>
          )}
        </PaneHeader>
        {this.props.debugButtons && (
          <DebugButtons
            style={openStyle}
            userInteracted={this.state.userInteracted}
          />
        )}
        {this.props.debugConsole && (
          <DebugConsole
            style={openStyle}
            debugButtons={this.props.debugButtons}
            debugConsoleDisabled={this.props.debugConsoleDisabled}
            debugWatch={showWatchPane}
            ref={debugConsole => (this._debugConsole = debugConsole)}
          />
        )}
        <div className={showWatchPane ? styles.displayInitial : styles.hidden}>
          <div
            id="watchersResizeBar"
            ref={watchersResizeBar =>
              (this._watchersResizeBar = watchersResizeBar)
            }
            onMouseDown={this.onMouseDownWatchersResizeBar}
          />
        </div>
        {showWatchPane && (
          <Watchers
            style={openStyle}
            ref={watchers => (this._watchers = watchers)}
            debugButtons={this.props.debugButtons}
          />
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    debugButtons: !!state.pageConstants.showDebugButtons,
    debugConsole: !!state.pageConstants.showDebugConsole,
    debugWatch: !!state.pageConstants.showDebugWatch,
    debugSlider: !!state.pageConstants.showDebugSlider,
    debugConsoleDisabled: !!state.pageConstants.debugConsoleDisabled,
    appType: state.pageConstants.appType,
    isRunning: state.runState.isRunning,
    isEditWhileRun: state.runState.isEditWhileRun,
    isDebuggerPaused: state.runState.isDebuggerPaused,
    isDebuggingSprites: state.runState.isDebuggingSprites,
    stepSpeed: state.runState.stepSpeed,
    isOpen: isOpen(state),
    isAttached: isAttached(state),
    canRunNext: canRunNext(state),
    commandHistory: getCommandHistory(state),
  }),
  {
    setStepSpeed,
    setIsDebuggingSprites,
    addWatchExpression,
    removeWatchExpression,
    clearLog,
    open,
    close,
  }
)(JsDebugger);
