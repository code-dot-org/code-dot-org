import $ from 'jquery';
var React = require('react');
var Radium = require('radium');
var connect = require('react-redux').connect;
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
var PaneHeader = require('./PaneHeader');
var PaneSection = PaneHeader.PaneSection;
var PaneButton = PaneHeader.PaneButton;
var msg = require('@cdo/locale');
var commonStyles = require('../commonStyles');
var color = require("../util/color");
var utils = require('@cdo/apps/utils');
import SettingsCog from '../lib/ui/SettingsCog';

var BLOCKS_GLYPH_LIGHT = "data:image/gif;base64,R0lGODlhEAAQAIAAAP///////yH+GkNyZWF0ZWQgd2l0aCBHSU1QIG9uIGEgTWFjACH5BAEKAAEALAAAAAAQABAAAAIdjI+py40AowRp2molznBzB3LTIWpGGZEoda7gCxYAOw==";
var BLOCKS_GLYPH_DARK = "data:image/gif;base64,R0lGODlhEAAQAIAAAE1XX01XXyH+GkNyZWF0ZWQgd2l0aCBHSU1QIG9uIGEgTWFjACH5BAEKAAEALAAAAAAQABAAAAIdjI+py40AowRp2molznBzB3LTIWpGGZEoda7gCxYAOw==";

var styles = {
  headerIcon: {
    fontSize: 18
  },
  chevron: {
    fontSize: 18,
  },
  runningChevron: {
    color: color.dark_charcoal
  },
  blocksGlyph: {
    display: 'none',
    height: 18,
    lineHeight: '24px',
    verticalAlign: 'text-bottom',
    paddingRight: 8
  },
  blocksGlyphRtl: {
    paddingRight: 0,
    paddingLeft: 8,
    transform: 'scale(-1, 1)',
    MozTransform: 'scale(-1, 1)',
    WebkitTransform: 'scale(-1, 1)',
    OTransform: 'scale(-1, 1)',
    msTransform: 'scale(-1, 1)',
  },
};

var CodeWorkspace = React.createClass({
  propTypes: {
    localeDirection: React.PropTypes.oneOf(['rtl', 'ltr']).isRequired,
    editCode: React.PropTypes.bool.isRequired,
    readonlyWorkspace: React.PropTypes.bool.isRequired,
    showDebugger: React.PropTypes.bool.isRequired,
    style: React.PropTypes.bool,
    isRunning: React.PropTypes.bool.isRequired,
    pinWorkspaceToBottom: React.PropTypes.bool.isRequired,
    isMinecraft: React.PropTypes.bool.isRequired
  },

  shouldComponentUpdate: function (nextProps) {
    // This component is current semi-protected. We don't want to completely
    // disallow rerendering, since that would prevent us from being able to
    // update styles. However, we do want to prevent property changes that would
    // change the DOM structure.
    Object.keys(nextProps).forEach(function (key) {
      // isRunning and style only affect style, and can be updated
      if (key === 'isRunning' || key === 'style') {
        return;
      }

      if (nextProps[key] !== this.props[key]) {
        throw new Error('Attempting to change key ' + key + ' in CodeWorkspace');
      }
    }.bind(this));

    return true;
  },

  onDebuggerSlide(debuggerHeight) {
    const textbox = this.codeTextbox.getRoot();
    if (textbox.style.bottom) {
      $(textbox).animate(
        {bottom: debuggerHeight},
        {step: utils.fireResizeEvent}
      );
    } else {
      // if we haven't initialized the height of the code textbox,
      // then don't bother animating it as we need it to be the
      // right height immediately during initialization.

      // TODO: find a way to do this better from StudioApp
      // where the editor gets initialized. We seem to have
      // an order of operations problem with regards to emitting
      // and listening to the resize events.
      textbox.style.bottom = debuggerHeight + 'px';
    }
  },

  render: function () {
    var props = this.props;

    // ignore runModeIndicators in MC
    var runModeIndicators = !props.isMinecraft;

    var chevronStyle = [
      styles.chevron,
      runModeIndicators && props.isRunning && styles.runningChevron
    ];

    // By default, continue to show header as focused. When runModeIndicators
    // is enabled, remove focus while running.
    var hasFocus = true;
    if (runModeIndicators && props.isRunning) {
      hasFocus = false;
    }

    var isRtl = props.localeDirection === 'rtl';

    var blocksGlyphImage = (
      <img
        id="blocks_glyph"
        src={hasFocus ? BLOCKS_GLYPH_LIGHT : BLOCKS_GLYPH_DARK}
        style={[
          styles.blocksGlyph,
          isRtl && styles.blocksGlyphRtl
        ]}
      />
    );

    return (
      <span id="codeWorkspaceWrapper" style={props.style}>
        <PaneHeader
          id="headers"
          dir={props.localeDirection}
          hasFocus={hasFocus}
          className={props.isRunning ? 'is-running' : ''}
        >
          <div id="codeModeHeaders">
            <PaneSection id="toolbox-header">
              <i id="hide-toolbox-icon" style={[commonStyles.hidden, chevronStyle]} className="fa fa-chevron-circle-right"/>
              <span style={{paddingLeft: '2em'}}>{props.editCode ? msg.toolboxHeaderDroplet() : msg.toolboxHeader()}</span>
              <SettingsCog/>
            </PaneSection>
            <PaneSection id="show-toolbox-header" style={commonStyles.hidden}>
              <i id="show-toolbox-icon" style={chevronStyle} className="fa fa-chevron-circle-right"/>
              <span>{msg.showToolbox()}</span>
            </PaneSection>
            <PaneButton
              id="show-code-header"
              hiddenImage={blocksGlyphImage}
              iconClass="fa fa-code"
              label={msg.showCodeHeader()}
              isRtl={isRtl}
              isMinecraft={props.isMinecraft}
              headerHasFocus={hasFocus}
            />
            {!props.readonlyWorkspace &&
              <PaneButton
                id="clear-puzzle-header"
                headerHasFocus={hasFocus}
                iconClass="fa fa-undo"
                label={msg.clearPuzzle()}
                isRtl={isRtl}
                isMinecraft={props.isMinecraft}
              />}
            <PaneButton
              id="versions-header"
              headerHasFocus={hasFocus}
              iconClass="fa fa-clock-o"
              label={msg.showVersionsHeader()}
              isRtl={isRtl}
              isMinecraft={props.isMinecraft}
            />
            <PaneSection id="workspace-header">
              <span id="workspace-header-span">
                {props.readonlyWorkspace ? msg.readonlyWorkspaceHeader() : msg.workspaceHeaderShort()}
              </span>
              <div id="blockCounter">
                <ProtectedStatefulDiv id="blockUsed" className="block-counter-default"/>
                <span> / </span>
                <span id="idealBlockNumber"></span>
                <span>{" " + msg.blocks()}</span>
              </div>
            </PaneSection>
          </div>
        </PaneHeader>
        {props.editCode &&
         <ProtectedStatefulDiv
           ref={codeTextbox => this.codeTextbox = codeTextbox}
           id="codeTextbox"
           className={this.props.pinWorkspaceToBottom ? 'pin_bottom' : ''}
         />
        }
        {props.showDebugger && (
          <JsDebugger
            onSlideShut={this.onDebuggerSlide}
            onSlideOpen={this.onDebuggerSlide}
          />
        )}
      </span>
    );
  }
});

module.exports = connect(state => ({
  editCode: state.pageConstants.isDroplet,
  localeDirection: state.pageConstants.localeDirection,
  readonlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  isRunning: !!state.runState.isRunning,
  showDebugger: !!(state.pageConstants.showDebugButtons || state.pageConstants.showDebugConsole),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  isMinecraft: !!state.pageConstants.isMinecraft
}))(Radium(CodeWorkspace));
