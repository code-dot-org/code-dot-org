/**
 * A React component for our JavaScript debugger UI. Returns a connected component
 * so this can only be used in cases where we have a redux store.
 */

var React = require('react');
var connect = require('react-redux').connect;

var i18n = require('@cdo/locale');
var commonStyles = require('../commonStyles');
var styleConstants = require('../styleConstants');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
var PaneHeader = require('./PaneHeader');
var PaneSection = PaneHeader.PaneSection;
var PaneButton = PaneHeader.PaneButton;
var experiments = require('../experiments');
var SpeedSlider = require('./SpeedSlider');
import {setStepSpeed} from '../redux/runState';

var styles = {
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
    userSelect: 'none',
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
  }
};

/**
 * The console for our debugger UI
 */
var DebugConsole = function (props) {
  var classes = 'debug-console';
  if (!props.debugButtons) {
    classes += ' no-commands';
  }
  if (!props.debugWatch) {
    classes += ' no-watch';
  }

  return (
    <div id="debug-console" className={classes}>
      <div id="debug-output" className="debug-output"/>
      <span className="debug-input-prompt">
        &gt;
      </span>
      <div contentEditable spellCheck="false" id="debug-input" className="debug-input"/>
    </div>
  );
};
DebugConsole.propTypes = {
  debugButtons: React.PropTypes.bool,
  debugWatch: React.PropTypes.bool,
};

/**
 * Buttons for stepping through code.
 */
var DebugButtons = function () {
  return (
    <div id="debug-commands" className="debug-commands">
      <div id="debug-buttons">
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="pauseButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="pause-btn icon21"/>
          {i18n.pause()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="continueButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="continue-btn icon21"/>
          {i18n.continue()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="stepOverButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-over-btn icon21"/>
          {i18n.stepOver()}
        </button>

        <button id="stepOutButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-out-btn icon21"/>
          {i18n.stepOut()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="stepInButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-in-btn icon21"/>
          {i18n.stepIn()}
        </button>
      </div>
    </div>
  );
};

/**
 * A watch window for our debugger.
 */
var DebugWatch = function (props) {
  var classes = 'debug-watch';
  if (!props.debugButtons) {
    classes += 'no-commands';
  }
  return (
    <div id="debug-watch" className={classes}/>
  );
};
DebugWatch.propTypes = {
  debugButtons: React.PropTypes.bool,
};

/**
 * The parent JsDebugger component.
 */
var JsDebugger = function (props) {
  var hasFocus = props.isDebuggerPaused;

  var sliderStyle = {
    marginLeft: props.debugButtons ? 5 : 45,
    marginRight: 5
  };

  return (
    <div id="debug-area">
      <div id="debugResizeBar" className="fa fa-ellipsis-h"></div>
      <PaneHeader
        id="debug-area-header"
        hasFocus={hasFocus}
        style={styles.debugAreaHeader}
      >
        <span
          style={styles.noUserSelect}
          className="header-text"
        >
          {i18n.debugConsoleHeader()}
        </span>
        <i id="show-hide-debug-icon" className="fa fa-chevron-circle-down" style={styles.showHideIcon}/>
        {props.debugButtons &&
        <PaneSection id="debug-commands-header">
          <i id="running-spinner" style={commonStyles.hidden} className="fa fa-spinner fa-spin"></i>
          <i id="paused-icon" style={commonStyles.hidden} className="fa fa-pause"></i>
          <span
            style={styles.noUserSelect}
            className="header-text"
          >
            {i18n.debugCommandsHeaderWhenOpen()}
          </span>
        </PaneSection>
        }
        {props.debugWatch &&
        <PaneSection id="debug-watch-header">
          <span
            style={styles.noUserSelect}
            className="header-text"
          >
            {i18n.debugWatchHeader()}
          </span>
        </PaneSection>
        }
        <PaneButton
          id="clear-console-header"
          iconClass="fa fa-eraser"
          label="Clear"
          headerHasFocus={hasFocus}
          isRtl={false}
        />
        {props.debugButtons && <SpeedSlider style={sliderStyle} hasFocus={hasFocus} value={props.stepSpeed} lineWidth={130} onChange={props.setStepSpeed}/>}
      </PaneHeader>
      {props.debugButtons && <DebugButtons/>}
      {props.debugConsole && <DebugConsole debugButtons={props.debugButtons} debugWatch={props.debugWatch}/>}
      {props.debugWatch && <DebugWatch debugButtons={props.debugButtons}/>}
    </div>
  );
};

JsDebugger.propTypes = {
  debugButtons: React.PropTypes.bool.isRequired,
  debugConsole: React.PropTypes.bool.isRequired,
  debugWatch: React.PropTypes.bool.isRequired,
  isDebuggerPaused: React.PropTypes.bool.isRequired,
  stepSpeed: React.PropTypes.number.isRequired,
  setStepSpeed: React.PropTypes.func.isRequired
};

module.exports = connect(function propsFromStore(state) {
  return {
    debugButtons: state.pageConstants.showDebugButtons,
    debugConsole: state.pageConstants.showDebugConsole,
    debugWatch: state.pageConstants.showDebugWatch,
    isDebuggerPaused: state.runState.isDebuggerPaused,
    stepSpeed: state.runState.stepSpeed
  };
}, function propsFromDispatch(dispatch) {
  return {
    setStepSpeed: function (stepSpeed) {
      dispatch(setStepSpeed(stepSpeed));
    }
  };
})(JsDebugger);
