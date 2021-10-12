import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import JavalabPanels from './JavalabPanels';
import {appendOutputLog, setIsDarkMode, setIsRunning} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions, {
  TabType
} from '@cdo/apps/templates/instructions/TopInstructions';
import {VIEWING_CODE_REVIEW_URL_PARAM} from '@cdo/apps/templates/instructions/ReviewTab';
import ControlButtons from './ControlButtons';
import {CsaViewMode} from './constants';
import styleConstants from '../styleConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';

class JavalabView extends React.Component {
  static propTypes = {
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object,
    viewMode: PropTypes.string.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    handleClearPuzzle: PropTypes.func.isRequired,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    disableFinishButton: PropTypes.bool,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    setIsDarkMode: PropTypes.func,
    channelId: PropTypes.string,
    isEditingStartSources: PropTypes.bool,
    isRunning: PropTypes.bool,
    setIsRunning: PropTypes.func,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    longInstructions: PropTypes.string,
    awaitingContainedResponse: PropTypes.bool,
    isSubmittable: PropTypes.bool,
    isSubmitted: PropTypes.bool
  };

  state = {
    isTesting: false
  };

  componentDidMount() {
    this.props.onMount();
  }

  compile = () => {
    this.props.appendOutputLog('Compiling program...');
    this.props.appendOutputLog('Compiled!');
  };

  // Sends redux call to update dark mode, which handles user preferences
  renderSettings = () => {
    const {isDarkMode, setIsDarkMode} = this.props;
    return [
      <a onClick={() => setIsDarkMode(!isDarkMode)} key="theme-setting">
        Switch to {isDarkMode ? 'light mode' : 'dark mode'}
      </a>
    ];
  };

  // This controls the 'run' button state
  toggleRun = () => {
    const toggledIsRunning = !this.props.isRunning;
    this.props.setIsRunning(toggledIsRunning);
    if (toggledIsRunning) {
      this.props.onRun();
    } else {
      this.props.onStop();
    }
  };

  // This controls the 'test' button state, but running/stopping tests
  // is not yet implemented and will need to be added here.
  toggleTest = () => {
    this.setState(
      state => ({isTesting: !state.isTesting}),
      () => {
        // TODO: Run/stop tests.
      }
    );
  };

  isLeftSideVisible = () => {
    // It's possible that a console level without instructions won't have
    // anything to show on the left side.
    return (
      this.props.viewMode !== CsaViewMode.CONSOLE ||
      !!this.props.longInstructions
    );
  };

  renderVisualization = width => {
    const {visualization} = this.props;
    if (visualization) {
      return (
        <div id="visualization-container" style={styles.preview}>
          {visualization}
        </div>
      );
    }

    // For levels without a visualization, still create a div so that the
    // updateLayout function can adjust the width of the entire left side.
    return (
      <div
        id="visualization"
        style={{
          ...styles.visualizationPlaceholder,
          width: width + styleConstants['resize-bar-width']
        }}
      >
        &nbsp;
      </div>
    );
  };

  render() {
    const {
      isDarkMode,
      viewMode,
      visualization,
      onCommitCode,
      onInputMessage,
      onContinue,
      isEditingStartSources,
      isRunning,
      showProjectTemplateWorkspaceIcon,
      disableFinishButton,
      awaitingContainedResponse,
      isSubmittable,
      isSubmitted,
      isProjectTemplateLevel,
      handleClearPuzzle
    } = this.props;
    const {isTesting} = this.state;

    if (isDarkMode) {
      document.body.style.backgroundColor = '#1b1c17';
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }

    return (
      <StudioAppWrapper>
        <div
          style={{
            ...styles.javalab
          }}
        >
          <JavalabPanels
            isLeftSideVisible={this.isLeftSideVisible()}
            viewMode={viewMode}
            visualization={visualization}
            topLeftPanel={height => (
              <TopInstructions
                mainStyle={styles.instructions}
                standalone
                displayDocumentationTab={false}
                displayReviewTab
                initialSelectedTab={
                  queryParams(VIEWING_CODE_REVIEW_URL_PARAM) === 'true'
                    ? TabType.REVIEW
                    : null
                }
                explicitHeight={height}
                resizable={false}
              />
            )}
            bottomLeftPanel={this.renderVisualization}
            topRightPanel={height => (
              <JavalabEditor
                onCommitCode={onCommitCode}
                showProjectTemplateWorkspaceIcon={
                  showProjectTemplateWorkspaceIcon
                }
                height={height}
                isProjectTemplateLevel={isProjectTemplateLevel}
                handleClearPuzzle={handleClearPuzzle}
              />
            )}
            bottomRightPanel={() => (
              <JavalabConsole
                onInputMessage={onInputMessage}
                style={{
                  ...styles.consoleParent,
                  ...(!this.isLeftSideVisible() && {paddingBottom: 40})
                }}
                bottomRow={
                  <ControlButtons
                    isRunning={isRunning}
                    isTesting={isTesting}
                    toggleRun={this.toggleRun}
                    toggleTest={this.toggleTest}
                    isEditingStartSources={isEditingStartSources}
                    disableFinishButton={disableFinishButton}
                    disableRunButtons={awaitingContainedResponse}
                    onContinue={() => onContinue(isSubmittable)}
                    renderSettings={this.renderSettings}
                    showTestButton={false}
                    isSubmittable={isSubmittable}
                    isSubmitted={isSubmitted}
                  />
                }
              />
            )}
          />
        </div>
      </StudioAppWrapper>
    );
  }
}

const styles = {
  instructions: {
    width: '100%',
    position: 'relative',
    marginLeft: 0,
    color: color.black,
    left: 0
  },
  consoleParent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexGrow: 1,
    overflowY: 'hidden'
  },
  visualizationPlaceholder: {
    height: 1,
    maxWidth: undefined,
    maxHeight: undefined,
    marginTop: styleConstants['resize-bar-width']
  },
  preview: {
    marginTop: styleConstants['resize-bar-width']
  },
  javalab: {
    display: 'flex',
    flexWrap: 'wrap',
    direction: 'ltr'
  },
  clear: {
    clear: 'both'
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    margin: '10px 0',
    overflowY: 'hidden'
  }
};

// We use the UnconnectedJavalabView to make this component's methods testable.
// This is a deprecated pattern but calling shallow().dive().instance() on the
// connected JavalabView does not give us access to the methods owned by JavalabView.
export const UnconnectedJavalabView = JavalabView;
export default connect(
  state => ({
    isProjectLevel: state.pageConstants.isProjectLevel,
    channelId: state.pageConstants.channelId,
    isDarkMode: state.javalab.isDarkMode,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    showProjectTemplateWorkspaceIcon: !!state.pageConstants
      .showProjectTemplateWorkspaceIcon,
    editorColumnHeight: state.javalab.editorColumnHeight,
    longInstructions: state.instructions.longInstructions,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    disableFinishButton: state.javalab.disableFinishButton,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning))
  })
)(UnconnectedJavalabView);
