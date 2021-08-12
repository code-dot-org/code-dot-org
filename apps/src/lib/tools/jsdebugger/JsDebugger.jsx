/**
 * A React component for our JavaScript debugger UI. Returns a connected component
 * so this can only be used in cases where we have a redux store.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import i18n from '@cdo/locale';
import Radium from 'radium';
import dom from '../../../dom';
import commonStyles from '../../../commonStyles';
import styleConstants from '../../../styleConstants';
import Watchers from '../../../templates/watchers/Watchers';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '../../../templates/PaneHeader';
import SpeedSlider from '../../../templates/SpeedSlider';
import FontAwesome from '../../../templates/FontAwesome';
import {setStepSpeed, setIsDebuggingSprites} from '../../../redux/runState';
import * as utils from '../../../utils';
import {
  add as addWatchExpression,
  remove as removeWatchExpression
} from '../../../redux/watchedExpressions';
import DebugConsole from './DebugConsole';
import DebugButtons from './DebugButtons';

import {
  // actions
  clearLog,
  open,
  close,

  // selectors
  isAttached,
  isOpen,
  canRunNext,
  getCommandHistory
} from './redux';

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
    style: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      watchersHidden: false,
      open: props.isOpen,
      openedHeight: 120,
      consoleWidth: 0,
      // For Google Analytics to see if student has opened the debugger
      userInteracted: false
    };
  }

  handleResizeConsole = () => {
    let debuggerWidth = 0;
    if (document.getElementById('debug-area-header')) {
      debuggerWidth = document.getElementById('debug-area-header').offsetWidth;
    }
    let commandsWidth = 0;
    if (document.getElementById('debug-commands-header')) {
      commandsWidth = document.getElementById('debug-commands-header')
        .offsetWidth;
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
      $(this.root)
        .find('#debug-area-header')
        .height() + $(this._debugResizeBar).height();
    this.setState({
      transitionType: 'closing',
      open: false,
      openedHeight: $(this.root).height(),
      closedHeight
    });
    this.props.onSlideShut && this.props.onSlideShut(closedHeight);
  }

  slideOpen() {
    this.setState({
      open: true,
      transitionType: 'opening'
    });
    this.props.onSlideOpen && this.props.onSlideOpen(this.state.openedHeight);
  }

  componentWillReceiveProps(nextProps) {
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
    // When we see a mouse down in the resize bar, start tracking mouse moves:
    const eventSourceElm = event.srcElement || event.target;
    if (eventSourceElm.id === 'debugResizeBar') {
      this._draggingDebugResizeBar = true;
      document.body.addEventListener(
        'mousemove',
        this.onMouseMoveDebugResizeBar
      );
      const mouseMoveTouchEventName = dom.getTouchEventName('mousemove');
      if (mouseMoveTouchEventName) {
        document.body.addEventListener(
          mouseMoveTouchEventName,
          this.onMouseMoveDebugResizeBar
        );
      }

      event.preventDefault();
    }
  };

  setDebugHeight = height => {
    if (!this.props.isOpen) {
      this.props.open();
      this.setState({
        open: true,
        openedHeight: height
      });
    } else {
      this.setState({
        openedHeight: height
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
    // When we see a mouse down in the resize bar, start tracking mouse moves:
    const eventSourceElm = event.srcElement || event.target;
    if (eventSourceElm.id === 'watchersResizeBar') {
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
    }
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
    const watchers = this._watchers;
    const watchersRect = watchers.scrollableContainer.getBoundingClientRect();
    const movement = watchersRect.left - event.clientX;
    const newDesiredWidth = watchersRect.width + movement;
    const newWatchersWidth = Math.max(
      MIN_WATCHERS_AREA_WIDTH,
      Math.min(MAX_WATCHERS_AREA_WIDTH, newDesiredWidth)
    );

    const watchersResizeRect = this._watchersResizeBar.getBoundingClientRect();
    const watchersResizeRight = newWatchersWidth - watchersResizeRect.width / 2;
    watchers.scrollableContainer.style.width = newWatchersWidth + 'px';
    this._debugConsole.root.style.right = newWatchersWidth + 'px';
    this._watchersResizeBar.style.right = watchersResizeRight + 'px';

    const headerLBorderWidth = 1;
    const watchersLRBorderWidth = 2;
    const extraWidthForHeader = watchersLRBorderWidth - headerLBorderWidth;
    this._debugWatchHeader.root.style.width =
      newWatchersWidth + extraWidthForHeader + 'px';

    this.handleResizeConsole();
  };

  onClearDebugOutput = () => this.props.clearLog();

  onToggleDebugSprites = () => {
    this.props.setIsDebuggingSprites(!this.props.isDebuggingSprites);
  };

  render() {
    const {appType, isAttached, canRunNext, isRunning} = this.props;
    const hasFocus = this.props.isDebuggerPaused && !this.props.isEditWhileRun;

    const canShowDebugSprites = appType === 'gamelab';

    const sliderStyle = {
      marginLeft: this.props.debugButtons ? 5 : 45,
      marginRight: 5
    };

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
        style={[
          {transition: debugAreaTransitionValue},
          this.props.style,
          {height}
        ]}
        onTransitionEnd={this.onTransitionEnd}
        ref={root => (this.root = root)}
      >
        <div
          id="debugResizeBar"
          className="fa fa-ellipsis-h"
          onMouseDown={this.onMouseDownDebugResizeBar}
          ref={debugResizeBar => (this._debugResizeBar = debugResizeBar)}
        />
        <PaneHeader
          id="debug-area-header"
          hasFocus={hasFocus}
          style={styles.debugAreaHeader}
        >
          <span
            style={[
              this.state.consoleWidth <= MIN_CONSOLE_WIDTH && styles.hidden,
              styles.noUserSelect
            ]}
            className="header-text"
          >
            {i18n.debugConsoleHeader()}
          </span>
          <FontAwesome
            icon={this.state.open ? 'chevron-circle-down' : 'chevron-circle-up'}
            style={styles.showHideIcon}
            onClick={this.slideToggle}
          />
          {this.props.debugButtons && (
            <PaneSection id="debug-commands-header">
              <FontAwesome
                id="running-spinner"
                style={!isAttached || canRunNext ? commonStyles.hidden : {}}
                icon="spinner"
                className="fa-spin"
              />
              <FontAwesome
                id="paused-icon"
                style={!isAttached || !canRunNext ? commonStyles.hidden : {}}
                icon="pause"
              />
              <span style={styles.noUserSelect} className="header-text">
                {this.state.open
                  ? i18n.debugCommandsHeaderWhenOpen()
                  : i18n.debugCommandsHeaderWhenClosed()}
              </span>
            </PaneSection>
          )}
          {this.props.debugWatch && (
            <PaneSection
              id="debug-watch-header"
              ref={debugWatchHeader =>
                (this._debugWatchHeader = debugWatchHeader)
              }
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
              style={
                this.state.watchersHidden
                  ? {
                      borderLeft: 'none',
                      textAlign: 'right',
                      marginRight: '30px'
                    }
                  : {}
              }
            >
              <FontAwesome
                id="hide-toolbox-icon"
                style={styles.showDebugWatchIcon}
                icon={
                  this.state.watchersHidden
                    ? 'chevron-circle-left'
                    : 'chevron-circle-right'
                }
              />
              <span style={styles.noUserSelect} className="header-text">
                {this.state.watchersHidden
                  ? i18n.debugShowWatchHeader()
                  : i18n.debugWatchHeader()}
              </span>
            </PaneSection>
          )}
          <PaneButton
            id="clear-console-header"
            iconClass="fa fa-eraser"
            label="Clear"
            headerHasFocus={hasFocus}
            isRtl={false}
            onClick={this.onClearDebugOutput}
          />
          {isRunning && canShowDebugSprites && (
            <PaneButton
              iconClass="fa fa-bug"
              label="Debug Sprites: Off"
              headerHasFocus={hasFocus}
              isRtl={false}
              isPressed={this.props.isDebuggingSprites}
              pressedLabel="Debug Sprites: On"
              onClick={this.onToggleDebugSprites}
            />
          )}
          {this.props.debugSlider && (
            <SpeedSlider
              style={sliderStyle}
              hasFocus={hasFocus}
              value={this.props.stepSpeed}
              lineWidth={130}
              onChange={this.props.setStepSpeed}
            />
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
        <div style={{display: showWatchPane ? 'initial' : 'none'}}>
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

const styles = {
  debugAreaHeader: {
    position: 'absolute',
    top: styleConstants['resize-bar-width'],
    left: 0,
    right: 0,
    textAlign: 'center',
    lineHeight: '30px'
  },
  noPadding: {
    padding: 0
  },
  noUserSelect: {
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none'
  },
  showHideIcon: {
    position: 'absolute',
    top: 0,
    left: 8,
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: 'white'
    }
  },
  showDebugWatchIcon: {
    position: 'absolute',
    top: 0,
    right: '6px',
    width: '18px',
    margin: 0,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: 'white'
    }
  },
  hidden: {
    display: 'none'
  }
};

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
    commandHistory: getCommandHistory(state)
  }),
  {
    setStepSpeed,
    setIsDebuggingSprites,
    addWatchExpression,
    removeWatchExpression,
    clearLog,
    open,
    close
  }
)(Radium(JsDebugger));
