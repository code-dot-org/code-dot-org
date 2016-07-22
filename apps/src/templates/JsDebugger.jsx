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

var sliderImages = {
  darkTurtle: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAMCAYAAABm+U3GAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEhMHWFBV9gAAAQpJREFUOMul0y9Lg1EUBvCfbCBMDQtqEGFB1mcxGgSbwaZg8mMYLFpsYhO/gMVkWxOxahCWBVnwXRAczmo5L1yu7zbRp5x7zz3n4Tl/bs10dLCLNXzh/Rc5Zia8beEIC5m/iwsUfyE+xfaEvDcc42lcQK3Ct4eDMfFDzGIeO2ji4TeKO7hMSGCUvDeSc9mifbTQjvsNipz4FstjSHM00IvzRiKmh5N61oKSdITPKYN/CbsYPS/RgnpMvx2ldWOtpuEu4tfj/kNEqXglCOdwH6qr9rUZdjPzX+E5ePrp8K79D2dBWOSKH7GK1yhvgPNkiJLKDqOvg7DwkX+YdCuWKpQUE755P/o8rIr9BkRqM7n1cwrvAAAAAElFTkSuQmCC",
  darkRabbit: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAPCAYAAAAPr1RWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEg0vuaTC0wAAAXFJREFUOMul079L1WEUBvDPzQwpTCiS6GaUrZKGq0Gg0BTZJghBQ1tT0H8QNAatTf0BQYOTYktQ0NJgVDTUomC3QL1xTfqhLc+FF7l6v9VZznnf7znP8z3nPG+P6jaDEfRitUrBwYrA5+NHcCvxSzxJ/LpTUU9F8LX88Ta+4hSGMYEW1pPzT+Ayijfx79P1SYzheyeCvwEvu/iEZ3iVkV3GJHbQSDddwS/iBh5k1hfwAwdCcgy/cQbvcA0fAt7qBn4bV4vzaUzhSkgOYRYnMFSIZBmrtS7Su1NxVN/iv+ARltDYD3wR/RVB+zGPhzk39tL5IK4n/ogjiQ/vQ/K5iBt7PaIZTAdwM20+zcKGcLbIbcUP423xoAbbBO2FTuI+xrOk55nbCyygGbKN6HkxOU38DOk5HMdKdP+rPfN7GMVctLuSQthCH46inrtmcuoBHseloqs5PK4Vei4B26C7ra/D9/KujpsYwN3aroQt/2clkT8FpVab2rcDgAAAAABJRU5ErkJggg==",
  lightTurtle: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAMCAYAAABm+U3GAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEjkwj4Y80QAAARJJREFUOMulk7FKQ0EQRc+IVUTBQi1ESCHptTGdheA3aJuPsLCwskkndiE/kMbKzk4sA1oI6QRBXqEpAgbTjs19MGw2eU+cZnZ3Zu/euTNr1DB3PwDawAQYmtlb1R2rADwBLoH1JPQA3JrZ15+B3f0aOF3y7idwZWYvueDKAtCzJaBT+R2g5+4XtRhLz14CMgspjbAuJToHmkBL+7sc8L3Y5EBTawAjrY8CmdFqRoISdAb8VDT/XX5LmpfWtND9lkrbAPZrTOGj8g9zwch4V4BrwJNYTzJ3NuWPk/M+8CqcwoIMA/5nXaAoZzsyfgb2gA+VNwZuQhNjZR3pOpYH+I4fxpLmbc/N44LfpbEspPM0zf0FoFJU5IxlTp4AAAAASUVORK5CYII=",
  lightRabbit: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAPCAYAAAAPr1RWAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AUCEjcsBQRNEAAAAX9JREFUOMuV0zFrVUEQBeBvwCJEEqukEeWhgiiCiIVYWATROqKFrUV6EfwH/gLbVBY2gpAilUQbCaKNRSQgGEnzCt8DwQRDurGZK5d4zbtv4LI7c3fP2Z09J/SMzHxY068R8bnPnhM9gc/X9ApWMhM+4DX8j6wXeETsZOZ8pXu4hZu4ivXM3IuInX/2mTLqFgMsFfgsXmHjKMHU4B1Ej3EZB3iJdxExmtiWzLyGO3hQpY9Yw27rlJtYwDesYJyZWxExmtTz+7jbym/Ut5+ZqxhjucAXas0SfmIUE6T3pGeH9mscYxVbEXEs+FvM9QSdwxs8L3V19zwzF3Gv0u84WfPZY0h+tGQ76tR5tWK5AA/qmms4izMlwSZ+13gO242hMnOxIYgq3K6Xbk75Hr9KAZu4hItFMo8vRXyhXDvAbtU3MIyIwwb8WeM2fMKwnCgiDjNzpkBPt1w6rHyA6+XaJtbxIlp6/gvYgHa8x8zR/+1akT3CKTyN9oIuwCkd2ybyB67+kmBPPxeyAAAAAElFTkSuQmCC"
};

/**
 * Slider for modifying speed. Ideall we will eventually have a common component
 * used here and by turtle.
 */
var Slider = function (props) {
  return (
    <div id="slider-cell" style={props.style}>
      <svg
        id="speed-slider"
        version="1.1"
        width="150"
        height="28"
      >
        {/*<!-- Slow icon. -->*/}
        <clipPath id="slowClipPath">
          <rect
            width={26}
            height={12}
            x={5}
            y={6}
          />
        </clipPath>
        {/* turtle image */}
        <image
          xlinkHref={props.hasFocus ? sliderImages.lightTurtle : sliderImages.darkTurtle}
          height={12}
          width={22}
          x={7}
          y={6}
        />
        {/*<!-- Fast icon. -->*/}
        <clipPath id="fastClipPath">
          <rect
            width={26}
            height={16}
            x={120}
            y={2}
          />
        </clipPath>
        {/* rabbit image */}
        <image
          xlinkHref={props.hasFocus ? sliderImages.lightRabbit : sliderImages.darkRabbit}
          height={15}
          width={23}
          x={121}
          y={3}
        />
      </svg>
    </div>
  );
};
Slider.propTypes = {
  hasFocus: React.PropTypes.bool.isRequired,
  style: React.PropTypes.object,
};

/**
 * The parent JsDebugger component.
 */
var JsDebugger = function (props) {
  var hasFocus = props.isDebuggerPaused;

  var sliderStyle = {
    marginLeft: props.debugButtons ? 0 : 40
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
        <Slider style={sliderStyle} hasFocus={hasFocus}/>
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
  isDebuggerPaused: React.PropTypes.bool.isRequired
};

module.exports = connect(function propsFromStore(state) {
  return {
    debugButtons: state.pageConstants.showDebugButtons,
    debugConsole: state.pageConstants.showDebugConsole,
    debugWatch: state.pageConstants.showDebugWatch,
    isDebuggerPaused: state.runState.isDebuggerPaused
  };
})(JsDebugger);
