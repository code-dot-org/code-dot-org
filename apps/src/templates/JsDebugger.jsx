var i18n = require('../locale');
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');

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

var DebugButtons = function () {
  return (
    <div id="debug-commands" className="debug-commands">
      <div id="debug-buttons">
        <span> </span>
        <button id="pauseButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="pause-btn icon21"/>
          {i18n.pause()}
        </button>
        <span> </span>
        <button id="continueButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="continue-btn icon21"/>
          {i18n.continue()}
        </button>
        <span> </span>
        <button id="stepOverButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-over-btn icon21"/>
          {i18n.stepOver()}
        </button>

        <button id="stepOutButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-out-btn icon21"/>
          {i18n.stepOut()}
        </button>
        <span> </span>
        <button id="stepInButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-in-btn icon21"/>
          {i18n.stepIn()}
        </button>
      </div>
    </div>
  );
};

var DebugWatch = function (props) {
  var classes = 'debug-watch';
  if (!props.debugButtons) {
    classes += 'no-commands';
  }
  return (
    <div id="debug-watch" className={classes}/>
  );
};

var JsDebugger = function (props) {
  var sliderStyle = {
    marginLeft: props.debugButtons ? 0 : 40
  };
  return (
    <ProtectedStatefulDiv id="debug-area">
      <div id="debugResizeBar" className="fa fa-ellipsis-h"></div>
      <div id="debug-area-header">
        <span className="header-text">{i18n.debugConsoleHeader()}</span>
        <i id="show-hide-debug-icon" className="fa fa-chevron-circle-down"/>
        {props.debugButtons && <div id="debug-commands-header" className="workspace-header">
          <i id="running-spinner" style={commonStyles.hidden} className="fa fa-spinner fa-spin"></i>
          <i id="paused-icon" style={commonStyles.hidden} className="fa fa-pause"></i>
          <span className="header-text">{i18n.debugCommandsHeaderWhenOpen()}</span>
        </div>}
        {props.debugWatch && <div id="debug-watch-header" className="workspace-header">
          <span className="header-text">{i18n.debugWatchHeader()}</span>
        </div>}
        <div id="clear-console-header" className="workspace-header workspace-header-button">
          <span>
            <i className="fa fa-eraser"/>
            Clear
          </span>
        </div>
        {/* possible we could one day have a common slider-cell component */}
        <div id="slider-cell" style={sliderStyle}>
          <svg id="speed-slider"
               version="1.1"
               width="150"
               height="28">
            {/*<!-- Slow icon. -->*/}
            <clipPath id="slowClipPath">
              <rect
                  width={26}
                  height={12}
                  x={5}
                  y={6} />
            </clipPath>
            <image xlinkHref="/blockly/media/turtle_icons.png"
                height={42}
                width={84}
                x={-21}
                y={-18}
                clipPath="url(#slowClipPath)" />
            {/*<!-- Fast icon. -->*/}
            <clipPath id="fastClipPath">
              <rect
                  width={26}
                  height={16}
                  x={120}
                  y={2} />
            </clipPath>
            <image
                xlinkHref="/blockly/media/turtle_icons.png"
                height={42}
                width={84}
                x={120}
                y={-19}
                clipPath="url(#fastClipPath)" />
          </svg>
        </div>
      </div>
      {props.debugButtons && <DebugButtons/>}
      {props.debugConsole && <DebugConsole debugButtons={props.debugButtons} debugWatch={props.debugWatch}/>}
      {props.debugWatch && <DebugWatch debugButtons={props.debugButtons}/>}
    </ProtectedStatefulDiv>
  );
};

JsDebugger.propTypes = {
  debugButtons: React.PropTypes.bool.isRequired,
  debugConsole: React.PropTypes.bool.isRequired,
  debugWatch: React.PropTypes.bool.isRequired
};

module.exports = JsDebugger;
