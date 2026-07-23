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

import WorkspaceAlert from '@cdo/apps/code-studio/components/WorkspaceAlert';
import JsDebugger from '@cdo/apps/lib/tools/jsdebugger/JsDebugger';
import styleConstants from '@cdo/apps/styleConstants';
import * as utils from '@cdo/apps/utils';
import i18n from '@cdo/locale';

import SettingsCog from '../code-studio/components/SettingsCog';
import {closeWorkspaceAlert} from '../code-studio/projectRedux';
import {queryParams} from '../code-studio/utils';
import {shouldUseRunModeIndicators} from '../redux/selectors';
import {singleton as studioApp} from '../StudioApp';
import color from '../util/color';

import moduleStyles from './code-workspace.module.css';
import PaneHeader, {PaneSection, PaneButton} from './PaneHeader';
import ProjectTemplateWorkspaceIcon from './ProjectTemplateWorkspaceIconV2';
import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import ShowCodeToggle from './ShowCodeToggle';

class CodeWorkspace extends React.Component {
  static propTypes = {
    displayNotStartedBanner: PropTypes.bool,
    displayOldVersionBanner: PropTypes.bool,
    inStartBlocksMode: PropTypes.bool,
    inToolboxBlocksMode: PropTypes.bool,
    isRtl: PropTypes.bool.isRequired,
    editCode: PropTypes.bool.isRequired,
    readonlyWorkspace: PropTypes.bool.isRequired,
    showDebugger: PropTypes.bool.isRequired,
    style: PropTypes.object,
    isRunning: PropTypes.bool.isRequired,
    pinWorkspaceToBottom: PropTypes.bool.isRequired,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
    runModeIndicators: PropTypes.bool.isRequired,
    withSettingsCog: PropTypes.bool,
    showMakerToggle: PropTypes.bool,
    autogenerateML: PropTypes.func,
    closeWorkspaceAlert: PropTypes.func,
    workspaceAlert: PropTypes.object,
    isProjectTemplateLevel: PropTypes.bool,
    hasIncompatibleSources: PropTypes.bool,
    failedToGenerateCode: PropTypes.bool,
  };

  shouldComponentUpdate(nextProps) {
    // This component is current semi-protected. We don't want to completely
    // disallow rerendering, since that would prevent us from being able to
    // update styles. However, we do want to prevent property changes that would
    // change the DOM structure.
    Object.keys(nextProps).forEach(
      function (key) {
        // isRunning and style only affect style, and can be updated
        // workspaceAlert, hasIncompatibleSources and failedToGenerateCode
        // are involved in displaying or closing workspace alert and therefore can be updated.
        if (
          key === 'isRunning' ||
          key === 'style' ||
          key === 'workspaceAlert' ||
          key === 'hasIncompatibleSources' ||
          key === 'failedToGenerateCode'
        ) {
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
      showMakerToggle,
      autogenerateML,
    } = this.props;
    const showSettingsCog = withSettingsCog && !readonlyWorkspace;

    const settingsCog = showSettingsCog && (
      <SettingsCog
        {...{isRunning, runModeIndicators, showMakerToggle, autogenerateML}}
      />
    );

    return (
      <>
        <PaneSection
          id="toolbox-header"
          key="toolbox-header"
          style={styles.toolboxHeaderContainer}
        >
          <MuiIconButton
            type="button"
            variant="outlined"
            color="secondary"
            size="extraSmall"
            aria-label="Hide the toolbox"
            id="hide-toolbox-icon"
            className="hide-toolbox-icon"
            onClick={this.onToggleToolbox}
            sx={{
              borderRadius: '50%',
              height: '1rem',
              width: '1rem',
            }}
          >
            <FontAwesomeV6Icon iconName="chevron-left" iconStyle="solid" />
          </MuiIconButton>
          <MuiTypography
            variant="body4"
            sx={{
              color: 'var(--text-neutral-white-fixed)',
            }}
          >
            {editCode ? i18n.toolboxHeaderDroplet() : i18n.toolboxHeader()}
          </MuiTypography>
          {settingsCog}
        </PaneSection>
        <PaneSection
          id="show-toolbox-header"
          key="show-toolbox-header"
          style={{
            alignItems: 'center',
            display: 'none',
            justifyContent: 'space-between',
            paddingLeft: '.5rem',
            paddingRight: '.5rem',
            gap: '0.5rem',
          }}
        >
          <span
            id="show-toolbox-click-target"
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.5rem',
            }}
          >
            <MuiIconButton
              type="button"
              variant="outlined"
              color="secondary"
              size="extraSmall"
              id="show-toolbox-icon"
              aria-label="Show the toolbox"
              className="show-toolbox-icon"
              onClick={this.onToggleToolbox}
              sx={{
                borderRadius: '50%',
                height: '1rem',
                width: '1rem',
              }}
            >
              <FontAwesomeV6Icon iconName="chevron-right" iconStyle="solid" />
            </MuiIconButton>
            <MuiTypography
              variant="body4"
              sx={{
                color: 'var(--text-neutral-white-fixed)',
              }}
            >
              {i18n.showToolbox()}
            </MuiTypography>
          </span>
          {settingsCog}
        </PaneSection>
      </>
    );
  }

  onToggleShowCode = usingBlocks => {
    this.blockCounterEl.style.display =
      usingBlocks && studioApp().enableShowBlockCount ? 'flex' : 'none';
  };

  // The workspace alert will be displayed at the bottom of codeTextbox if editCode is
  // assigned true (implies Droplet, not Blockly). Otherwise, it is displayed at the bottom
  // of the CodeWorkspace
  renderWorkspaceAlert(isBlocklyType) {
    return (
      <WorkspaceAlert
        type={this.props.workspaceAlert.type}
        onClose={this.props.closeWorkspaceAlert}
        isBlockly={isBlocklyType}
        displayBottom={this.props.workspaceAlert.displayBottom}
      >
        <div>{this.props.workspaceAlert.message}</div>
      </WorkspaceAlert>
    );
  }

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
          className={props.isRunning ? 'is-running' : ''}
        >
          {this.renderToolboxHeaders()}
          <PaneSection
            id="workspace-header"
            style={{
              alignItems: 'center',
              flex: '1 1 0',
              gap: '0.5rem',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {props.showProjectTemplateWorkspaceIcon && (
              <ProjectTemplateWorkspaceIcon
                tooltipPlace="onTop"
                className={classNames(
                  moduleStyles.projectIcon,
                  'projectTemplateWorkspaceIcon'
                )}
              />
            )}
            <MuiTypography
              variant="body4"
              id="workspace-header-span"
              sx={{
                color: 'var(--text-neutral-white-fixed)',
              }}
            >
              {props.readonlyWorkspace
                ? i18n.readonlyWorkspaceHeader()
                : i18n.workspaceHeaderShort()}
            </MuiTypography>
            <MuiTypography
              variant="body4"
              // body4 maps to <p> in the code.org theme, and the block count is
              // filled in by a ProtectedStatefulDiv - a <div> in a <p> is
              // invalid nesting, so render this one as a div.
              component="div"
              id="blockCounter"
              ref={el => (this.blockCounterEl = el)}
              sx={{
                color: 'var(--text-neutral-white-fixed)',
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
              }}
            >
              <span>-</span>
              <ProtectedStatefulDiv
                id="blockUsed"
                className="block-counter-default"
              />
              <span>/</span>
              <span id="idealBlockNumber" />
              <span>{' ' + i18n.blocks()}</span>
            </MuiTypography>
          </PaneSection>
          <PaneButton
            id="settings-header"
            headerHasFocus={hasFocus}
            iconProps={{iconName: 'gear', iconStyle: 'solid'}}
            label={'Settings'}
            isRtl={isRtl}
            isMinecraft={props.isMinecraft}
          />
          <PaneButton
            id="versions-header"
            headerHasFocus={hasFocus}
            iconProps={{iconName: 'clock', iconStyle: 'regular'}}
            label={i18n.showVersionsHeader()}
            isRtl={isRtl}
            isMinecraft={props.isMinecraft}
          />
          {!props.readonlyWorkspace && (
            <PaneButton
              id="clear-puzzle-header"
              headerHasFocus={hasFocus}
              iconProps={{iconName: 'rotate-left', iconStyle: 'solid'}}
              label={i18n.clearPuzzle()}
              isRtl={isRtl}
              isMinecraft={props.isMinecraft}
            />
          )}
          <ShowCodeToggle
            isRtl={isRtl}
            hasFocus={hasFocus}
            isMinecraft={props.isMinecraft}
            onToggle={this.onToggleShowCode}
          />
        </PaneHeader>
        {props.editCode && (
          <ProtectedStatefulDiv
            ref={codeTextbox => (this.codeTextbox = codeTextbox)}
            id="codeTextbox"
            className={classNames(
              this.props.pinWorkspaceToBottom ? 'pin_bottom' : '',
              this.props.inStartBlocksMode || this.props.inToolboxBlocksMode
                ? 'has_banner'
                : ''
            )}
            canUpdate={true}
          >
            {this.props.workspaceAlert && this.renderWorkspaceAlert(false)}
          </ProtectedStatefulDiv>
        )}
        {this.props.displayNotStartedBanner && !inCsfExampleSolution && (
          <div
            id="notStartedBanner"
            style={{...styles.topBanner, ...styles.studentNotStartedWarning}}
          >
            {i18n.levelNotStartedWarning()}
          </div>
        )}
        {this.props.displayOldVersionBanner && (
          <div
            id="oldVersionBanner"
            style={{...styles.topBanner, ...styles.oldVersionWarning}}
          >
            {i18n.oldVersionWarning()}
          </div>
        )}
        {this.props.inStartBlocksMode && (
          <>
            <div
              id="startBlocksBanner"
              style={{...styles.topBanner, ...styles.startBlocksBanner}}
            >
              {this.props.isProjectTemplateLevel
                ? i18n.startBlocksTemplateWarning()
                : i18n.inStartBlocksMode()}
            </div>
          </>
        )}
        {this.props.inToolboxBlocksMode && (
          <>
            <div
              id="toolboxBlocksBanner"
              style={{...styles.topBanner, ...styles.toolboxBlocksBanner}}
            >
              {i18n.inToolboxBlocksMode()}
            </div>
          </>
        )}
        {this.props.hasIncompatibleSources && (
          <div
            id="incompatibleSourcesBanner"
            style={{...styles.topBanner, ...styles.errorBanner}}
          >
            {i18n.jsonInCdoBlockly()}
          </div>
        )}
        {this.props.failedToGenerateCode && (
          <div
            id="failedToGenerateCodeBanner"
            style={{...styles.topBanner, ...styles.errorBanner}}
          >
            {i18n.failedToGenerateBlocklyCode()}
          </div>
        )}
        {props.showDebugger && (
          <JsDebugger
            onSlideShut={this.onDebuggerSlide}
            onSlideOpen={this.onDebuggerSlide}
          />
        )}
        {!props.editCode &&
          this.props.workspaceAlert &&
          this.renderWorkspaceAlert(true)}
      </span>
    );
  }
}

const styles = {
  headerIcon: {
    fontSize: 18,
  },
  runningIcon: {
    color: color.neutral_white,
    ':hover': {
      color: color.neutral_dark20,
    },
  },
  oldVersionWarning: {
    backgroundColor: color.lightest_red,
    textAlign: 'center',
  },
  studentNotStartedWarning: {
    backgroundColor: color.lightest_red,
  },
  startBlocksBanner: {
    backgroundColor: color.lighter_yellow,
  },
  toolboxBlocksBanner: {
    backgroundColor: color.lighter_teal,
  },
  topBanner: {
    zIndex: 99,
    padding: 5,
    opacity: 0.9,
    position: 'relative',
    height: 'fit-content',
  },
  errorBanner: {
    backgroundColor: color.lightest_red,
  },
  chevronButton: {
    padding: 0,
    margin: 0,
    border: 'none',
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    backgroundColor: 'transparent',
    color: color.neutral_white,
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: color.neutral_dark20,
      boxShadow: 'none',
    },
  },
  toolboxHeaderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '.5rem',
    paddingRight: '.5rem',
    borderRight: '1px solid var(--borders-neutral-strong)',
    height: '30px',
  },
};

export const UnconnectedCodeWorkspace = CodeWorkspace;
export default connect(
  state => ({
    displayNotStartedBanner: state.pageConstants.displayNotStartedBanner,
    displayOldVersionBanner: state.pageConstants.displayOldVersionBanner,
    editCode: state.pageConstants.isDroplet,
    inStartBlocksMode: state.pageConstants.inStartBlocksMode,
    inToolboxBlocksMode: state.pageConstants.inToolboxBlocksMode,
    isRtl: state.isRtl,
    readonlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    isRunning: !!state.runState.isRunning,
    showDebugger: !!(
      state.pageConstants.showDebugButtons ||
      state.pageConstants.showDebugConsole
    ),
    pinWorkspaceToBottom: state.pageConstants.pinWorkspaceToBottom,
    showProjectTemplateWorkspaceIcon:
      !!state.pageConstants.showProjectTemplateWorkspaceIcon,
    isMinecraft: !!state.pageConstants.isMinecraft,
    runModeIndicators: shouldUseRunModeIndicators(state),
    showMakerToggle: !!state.pageConstants.showMakerToggle,
    workspaceAlert: state.project.workspaceAlert,
    isProjectTemplateLevel: state.pageConstants.isProjectTemplateLevel,
    hasIncompatibleSources: state.blockly.hasIncompatibleSources,
    failedToGenerateCode: state.blockly.failedToGenerateCode,
  }),
  dispatch => ({
    closeWorkspaceAlert: () => dispatch(closeWorkspaceAlert()),
  })
)(CodeWorkspace);
