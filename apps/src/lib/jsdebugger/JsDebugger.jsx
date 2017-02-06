/**
 * A React component for our JavaScript debugger UI. Returns a connected component
 * so this can only be used in cases where we have a redux store.
 */

var React = require('react');
var connect = require('react-redux').connect;

var i18n = require('@cdo/locale');
var commonStyles = require('@cdo/apps/commonStyles');
var styleConstants = require('@cdo/apps/styleConstants');
import {ConnectedWatchers} from '@cdo/apps/templates/watchers/Watchers';
var PaneHeader = require('@cdo/apps/templates/PaneHeader');
var PaneSection = PaneHeader.PaneSection;
var PaneButton = PaneHeader.PaneButton;
var SpeedSlider = require('@cdo/apps/templates/SpeedSlider');
import {setStepSpeed} from '@cdo/apps/redux/runState';
import ProtectedStatefulDiv from '@cdo/apps/templates/ProtectedStatefulDiv';
import JsDebuggerUi from './JsDebuggerUi';

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
 * The parent JsDebugger component.
 */
var UnconnectedJsDebugger = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool.isRequired,
    debugConsole: React.PropTypes.bool.isRequired,
    debugWatch: React.PropTypes.bool.isRequired,
    debugSlider: React.PropTypes.bool.isRequired,
    debuggerUi: React.PropTypes.instanceOf(JsDebuggerUi).isRequired,
    isDebuggerPaused: React.PropTypes.bool.isRequired,
    stepSpeed: React.PropTypes.number.isRequired,
    setStepSpeed: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
  },

  getInitialState() {
    return {
      watchersHidden: false
    };
  },

  componentDidMount() {
    this.props.debuggerUi.initializeAfterDomCreated({
      defaultStepSpeed: this.props.stepSpeed,
      root: this.root,
    });
  },

  render() {
    var hasFocus = this.props.isDebuggerPaused;

    var sliderStyle = {
      marginLeft: this.props.debugButtons ? 5 : 45,
      marginRight: 5
    };

    const showWatchPane = this.props.debugWatch && !this.state.watchersHidden;
    return (
      <div id="debug-area" style={this.props.style || {}} ref={root => this.root = root}>
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
          {this.props.debugButtons &&
          <PaneSection id="debug-commands-header">
            <i id="running-spinner" style={commonStyles.hidden} className="fa fa-spinner fa-spin"/>
            <i id="paused-icon" style={commonStyles.hidden} className="fa fa-pause"/>
            <span
              style={styles.noUserSelect}
              className="header-text"
            >
              {i18n.debugCommandsHeaderWhenOpen()}
            </span>
          </PaneSection>
          }
          {this.props.debugWatch &&
          <PaneSection
            id="debug-watch-header"
            onClick={() => {
              // call JsDebuggerUi.js logic to reset resizer-overridden styles
              // (remove once JsDebuggerUi.js resize logic migrated to React)
              if (!this.state.watchersHidden) {
                const resetResizeEvent = document.createEvent('Event');
                resetResizeEvent.initEvent('resetWatchersResizableElements', true, true);
                document.dispatchEvent(resetResizeEvent);
              }

              this.setState({watchersHidden: !this.state.watchersHidden});
            }}
            style={this.state.watchersHidden ? {
              borderLeft: 'none',
              textAlign: 'right',
              marginRight: '30px'
            } : {}}
          >
            <i
              id="hide-toolbox-icon"
              style={styles.showDebugWatchIcon}
              className={"fa " + (this.state.watchersHidden ? "fa-chevron-circle-left" : "fa-chevron-circle-right")}
            />
            <span
              style={styles.noUserSelect}
              className="header-text"
            >
              {this.state.watchersHidden ? 'Show Watch' : i18n.debugWatchHeader()}
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
          {this.props.debugSlider && <SpeedSlider style={sliderStyle} hasFocus={hasFocus} value={this.props.stepSpeed} lineWidth={130} onChange={this.props.setStepSpeed}/>}
        </PaneHeader>
        {this.props.debugButtons && <DebugButtons/>}
        {this.props.debugConsole && <DebugConsole debugButtons={this.props.debugButtons} debugWatch={showWatchPane}/>}
        <div style={{display: showWatchPane ? 'initial' : 'none'}}>
          <ProtectedStatefulDiv>
            <div id="watchersResizeBar"></div>
          </ProtectedStatefulDiv>
        </div>
        {showWatchPane && <ConnectedWatchers debugButtons={this.props.debugButtons}/>}
      </div>
    );
  }
});

export {UnconnectedJsDebugger};

export default connect(function propsFromStore(state) {
  return {
    debugButtons: state.pageConstants.showDebugButtons,
    debugConsole: state.pageConstants.showDebugConsole,
    debugWatch: state.pageConstants.showDebugWatch,
    debugSlider: state.pageConstants.showDebugSlider,
    debuggerUi: state.pageConstants.debuggerUi,
    isDebuggerPaused: state.runState.isDebuggerPaused,
    stepSpeed: state.runState.stepSpeed
  };
}, function propsFromDispatch(dispatch) {
  return {
    setStepSpeed: function (stepSpeed) {
      dispatch(setStepSpeed(stepSpeed));
    }
  };
})(UnconnectedJsDebugger);
