import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import {connect} from 'react-redux';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
import PaneHeader, {PaneSection, PaneButton} from './PaneHeader';
import i18n from '@cdo/locale';
import commonStyles from '../commonStyles';
import color from '../util/color';
import * as utils from '@cdo/apps/utils';
import {shouldUseRunModeIndicators} from '../redux/selectors';
import SettingsCog from '../lib/ui/SettingsCog';
import ShowCodeToggle from './ShowCodeToggle';
import {singleton as studioApp} from '../StudioApp';
import ProjectTemplateWorkspaceIcon from './ProjectTemplateWorkspaceIcon';
import {queryParams} from '../code-studio/utils';

const styles = {
  headerIcon: {
    fontSize: 18
  },
  chevron: {
    fontSize: 18,
    ':hover': {
      color: color.white
    }
  },
  runningIcon: {
    color: color.dark_charcoal
  },
  studentNotStartedWarning: {
    zIndex: 99,
    backgroundColor: color.lightest_red,
    width: '100%',
    height: 20,
    padding: 5,
    opacity: 0.9
  }
};

class CodeWorkspace extends React.Component {
  static propTypes = {
    studentHasNotStartedLevel: PropTypes.bool,
    isRtl: PropTypes.bool.isRequired,
    editCode: PropTypes.bool.isRequired,
    readonlyWorkspace: PropTypes.bool.isRequired,
    showDebugger: PropTypes.bool.isRequired,
    style: PropTypes.bool,
    isRunning: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
    runModeIndicators: PropTypes.bool.isRequired,
    withSettingsCog: PropTypes.bool,
    showMakerToggle: PropTypes.bool
  };

  shouldComponentUpdate(nextProps) {
    // This component is current semi-protected. We don't want to completely
    // disallow rerendering, since that would prevent us from being able to
    // update styles. However, we do want to prevent property changes that would
    // change the DOM structure.
    Object.keys(nextProps).forEach(
      function(key) {
        // isRunning and style only affect style, and can be updated
        if (key === 'isRunning' || key === 'style') {
          return;
        }

        if (nextProps[key] !== this.props[key]) {
          throw new Error(
            'Attempting to change key ' + key + ' in CodeWorkspace'
          );
        }
      }.bind(this)
    );

    return true;
  }

  onDebuggerSlide = debuggerHeight => {
    const textbox = this.codeTextbox.getRoot();
    if (textbox.style.bottom) {
      $(textbox).animate(
        {bottom: debuggerHeight},
        {done: utils.fireResizeEvent}
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
  };

  renderToolboxHeaders() {
    const {
      editCode,
      isRunning,
      runModeIndicators,
      readonlyWorkspace,
      withSettingsCog,
      showMakerToggle
    } = this.props;
    const showSettingsCog = withSettingsCog && !readonlyWorkspace;
    const textStyle = showSettingsCog ? {paddingLeft: '2em'} : undefined;
    const chevronStyle = [
      styles.chevron,
      runModeIndicators && isRunning && styles.runningIcon
    ];

    const settingsCog = showSettingsCog && (
      <SettingsCog {...{isRunning, runModeIndicators, showMakerToggle}} />
    );

    return [
      <PaneSection id="toolbox-header" key="toolbox-header">
        <i
          id="hide-toolbox-icon"
          style={[commonStyles.hidden, chevronStyle]}
          className="fa fa-chevron-circle-right"
        />
        <span style={textStyle}>
          {editCode ? i18n.toolboxHeaderDroplet() : i18n.toolboxHeader()}
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
          <span>{i18n.showToolbox()}</span>
        </span>
        {settingsCog}
      </PaneSection>
    ];
  }

  onToggleShowCode = usingBlocks => {
    this.blockCounterEl.style.display =
      usingBlocks && studioApp().enableShowBlockCount ? 'inline-block' : 'none';
  };

  render() {
    const props = this.props;

    // By default, continue to show header as focused. When runModeIndicators
    // is enabled, remove focus while running.
    const hasFocus = !(props.runModeIndicators && props.isRunning);
    const isRtl = this.props.isRtl;

    //TODO: When CSF example solutions are no longer rendered with solution=true in url remove this
    const inCsfExampleSolution = queryParams('solution') === 'true';

    return (
      <span id="codeWorkspaceWrapper" style={props.style}>
        <PaneHeader
          id="headers"
          dir={isRtl ? 'rtl' : 'ltr'}
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
            {!props.readonlyWorkspace && (
              <PaneButton
                id="clear-puzzle-header"
                headerHasFocus={hasFocus}
                iconClass="fa fa-undo"
                label={i18n.clearPuzzle()}
                isRtl={isRtl}
                isMinecraft={props.isMinecraft}
              />
            )}
            <PaneButton
              id="versions-header"
              headerHasFocus={hasFocus}
              iconClass="fa fa-clock-o"
              label={i18n.showVersionsHeader()}
              isRtl={isRtl}
              isMinecraft={props.isMinecraft}
            />
            <PaneSection id="workspace-header">
              {props.showProjectTemplateWorkspaceIcon && (
                <ProjectTemplateWorkspaceIcon />
              )}
              <span id="workspace-header-span">
                {props.readonlyWorkspace
                  ? i18n.readonlyWorkspaceHeader()
                  : i18n.workspaceHeaderShort()}
              </span>
              <div id="blockCounter" ref={el => (this.blockCounterEl = el)}>
                <ProtectedStatefulDiv
                  id="blockUsed"
                  className="block-counter-default"
                />
                <span> / </span>
                <span id="idealBlockNumber" />
                <span>{' ' + i18n.blocks()}</span>
              </div>
            </PaneSection>
          </div>
        </PaneHeader>
        {props.editCode && (
          <ProtectedStatefulDiv
            ref={codeTextbox => (this.codeTextbox = codeTextbox)}
            id="codeTextbox"
            className={this.props.pinWorkspaceToBottom ? 'pin_bottom' : ''}
          />
        )}
        {this.props.studentHasNotStartedLevel && !inCsfExampleSolution && (
          <div style={styles.studentNotStartedWarning}>
            {i18n.levelNotStartedWarning()}
          </div>
        )}
        {props.showDebugger && (
          <JsDebugger
            onSlideShut={this.onDebuggerSlide}
            onSlideOpen={this.onDebuggerSlide}
          />
        )}
      </span>
    );
  }
}

export const UnconnectedCodeWorkspace = Radium(CodeWorkspace);
export default connect(state => ({
  studentHasNotStartedLevel: state.pageConstants.isNotStartedLevel,
  editCode: state.pageConstants.isDroplet,
  isRtl: state.isRtl,
  readonlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
  isRunning: !!state.runState.isRunning,
  showDebugger: !!(
    state.pageConstants.showDebugButtons || state.pageConstants.showDebugConsole
  ),
  pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
  showProjectTemplateWorkspaceIcon: !!state.pageConstants
    .showProjectTemplateWorkspaceIcon,
  isMinecraft: !!state.pageConstants.isMinecraft,
  runModeIndicators: shouldUseRunModeIndicators(state),
  showMakerToggle: !!state.pageConstants.showMakerToggle
}))(Radium(CodeWorkspace));
