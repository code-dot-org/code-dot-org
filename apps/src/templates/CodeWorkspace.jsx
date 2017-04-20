import $ from 'jquery';
import React from 'react';
var Radium = require('radium');
var connect = require('react-redux').connect;
var ProtectedStatefulDiv = require('./ProtectedStatefulDiv');
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
import PaneHeader, {PaneSection, PaneButton} from './PaneHeader';
var msg = require('@cdo/locale');
var commonStyles = require('../commonStyles');
var color = require("../util/color");
var utils = require('@cdo/apps/utils');
import {shouldUseRunModeIndicators} from '../redux/selectors';
import SettingsCog from '../lib/ui/SettingsCog';
import ShowCodeToggle from './ShowCodeToggle';
import {singleton as studioApp} from '../StudioApp';

var styles = {
  headerIcon: {
    fontSize: 18
  },
  chevron: {
    fontSize: 18,
    ':hover': {
      color: color.white,
    },
  },
  runningIcon: {
    color: color.dark_charcoal
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
    isMinecraft: React.PropTypes.bool.isRequired,
    runModeIndicators: React.PropTypes.bool.isRequired,
    withSettingsCog: React.PropTypes.bool,
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
      utils.fireResizeEvent();
    }
  },

  renderToolboxHeaders() {
    const {
      editCode,
      isRunning,
      runModeIndicators,
      readonlyWorkspace,
      withSettingsCog,
    } = this.props;
    const showSettingsCog = withSettingsCog && !readonlyWorkspace;
    const textStyle = showSettingsCog ? {paddingLeft: '2em'} : undefined;
    const chevronStyle = [
      styles.chevron,
      runModeIndicators && isRunning && styles.runningIcon
    ];

    const settingsCog = showSettingsCog &&
        <SettingsCog {...{isRunning, runModeIndicators}}/>;
    return [
      <PaneSection
        id="toolbox-header"
        key="toolbox-header"
      >
        <i
          id="hide-toolbox-icon"
          style={[commonStyles.hidden, chevronStyle]}
          className="fa fa-chevron-circle-right"
        />
        <span style={textStyle}>
          {editCode ? msg.toolboxHeaderDroplet() : msg.toolboxHeader()}
        </span>
        {settingsCog}
      </PaneSection>,
      <PaneSection
        id="show-toolbox-header"
        key="show-toolbox-header"
        style={commonStyles.hidden}
      >
        <span id="show-toolbox-click-target">
          <i
            id="show-toolbox-icon"
            style={chevronStyle}
            className="fa fa-chevron-circle-right"
          />
          <span>
            {msg.showToolbox()}
          </span>
        </span>
        {settingsCog}
      </PaneSection>
    ];
  },

  onToggleShowCode(usingBlocks) {
    this.blockCounterEl.style.display =
        (usingBlocks && studioApp.enableShowBlockCount) ? 'inline-block' : 'none';
  },

  render() {
    var props = this.props;

    // By default, continue to show header as focused. When runModeIndicators
    // is enabled, remove focus while running.
    var hasFocus = true;
    if (props.runModeIndicators && props.isRunning) {
      hasFocus = false;
    }

    var isRtl = props.localeDirection === 'rtl';

    return (
      <span id="codeWorkspaceWrapper" style={props.style}>
        <PaneHeader
          id="headers"
          dir={props.localeDirection}
          hasFocus={hasFocus}
          className={props.isRunning ? 'is-running' : ''}
        >
          <div id="codeModeHeaders">
            {this.renderToolboxHeaders()}
            <ShowCodeToggle
              isRtl={isRtl}
              hasFocus={hasFocus}
              isMinecraft={props.isMinecraft}
              onToggle={this.onToggleShowCode}
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
              <div id="blockCounter" ref={el => this.blockCounterEl = el}>
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
  isMinecraft: !!state.pageConstants.isMinecraft,
  runModeIndicators: shouldUseRunModeIndicators(state),
}))(Radium(CodeWorkspace));
