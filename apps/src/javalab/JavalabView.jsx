import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import JavalabPanels from './JavalabPanels';
import {
  appendOutputLog,
  setDisplayTheme,
  setIsRunning,
  setIsTesting
} from './javalabRedux';
import {DisplayTheme} from './DisplayTheme';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions, {
  TabType
} from '@cdo/apps/templates/instructions/TopInstructions';
import javalabMsg from '@cdo/javalab/locale';
import {hasInstructions} from '@cdo/apps/templates/instructions/utils';
import {VIEWING_CODE_REVIEW_URL_PARAM} from '@cdo/apps/templates/instructions/ReviewTab';
import ControlButtons from './ControlButtons';
import {CsaViewMode} from './constants';
import styleConstants from '../styleConstants';
import {queryParams} from '@cdo/apps/code-studio/utils';
import experiments from '@cdo/apps/util/experiments';

class JavalabView extends React.Component {
  static propTypes = {
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onTest: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object,
    viewMode: PropTypes.string.isRequired,
    isProjectTemplateLevel: PropTypes.bool.isRequired,
    handleClearPuzzle: PropTypes.func.isRequired,
    onPhotoPrompterFileSelected: PropTypes.func.isRequired,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    disableFinishButton: PropTypes.bool,
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)).isRequired,
    appendOutputLog: PropTypes.func,
    setDisplayTheme: PropTypes.func,
    channelId: PropTypes.string,
    isEditingStartSources: PropTypes.bool,
    isRunning: PropTypes.bool,
    setIsRunning: PropTypes.func,
    isTesting: PropTypes.bool,
    setIsTesting: PropTypes.func,
    canRun: PropTypes.bool,
    canTest: PropTypes.bool,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    longInstructions: PropTypes.string,
    hasContainedLevels: PropTypes.bool,
    awaitingContainedResponse: PropTypes.bool,
    isSubmittable: PropTypes.bool,
    isSubmitted: PropTypes.bool
  };

  componentDidMount() {
    this.props.onMount();
  }

  compile = () => {
    this.props.appendOutputLog(javalabMsg.compilingProgram());
    this.props.appendOutputLog(javalabMsg.compiled());
  };

  // Sends redux call to update dark mode, which handles user preferences
  renderSettings = () => {
    const {displayTheme, setDisplayTheme} = this.props;
    const displayThemeString =
      displayTheme === DisplayTheme.DARK
        ? javalabMsg.displayThemeLightMode()
        : javalabMsg.displayThemeDarkMode();

    return [
      <a
        onClick={() =>
          setDisplayTheme(
            displayTheme === DisplayTheme.DARK
              ? DisplayTheme.LIGHT
              : DisplayTheme.DARK
          )
        }
        key="theme-setting"
      >
        {javalabMsg.switchToDisplayTheme({displayTheme: displayThemeString})}
      </a>
    ];
  };

  // This controls the 'run' button state
  toggleRun = () => {
    const {canRun, isRunning, setIsRunning, onRun, onStop} = this.props;
    if (!canRun) {
      return;
    }
    const toggledIsRunning = !isRunning;
    setIsRunning(toggledIsRunning);
    if (toggledIsRunning) {
      onRun();
    } else {
      onStop();
    }
  };

  // This controls the 'test' button state
  toggleTest = () => {
    const {canTest, isTesting, setIsTesting, onTest, onStop} = this.props;
    if (!canTest) {
      return;
    }
    const toggledIsTesting = !isTesting;
    setIsTesting(toggledIsTesting);
    if (toggledIsTesting) {
      onTest();
    } else {
      onStop();
    }
  };

  isLeftSideVisible = () => {
    const {longInstructions, hasContainedLevels} = this.props;
    // It's possible that a console level without instructions won't have
    // anything to show on the left side.
    return (
      this.props.viewMode !== CsaViewMode.CONSOLE ||
      hasInstructions(null, longInstructions, hasContainedLevels)
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
      displayTheme,
      viewMode,
      visualization,
      onCommitCode,
      onInputMessage,
      onContinue,
      isEditingStartSources,
      isRunning,
      isTesting,
      showProjectTemplateWorkspaceIcon,
      disableFinishButton,
      awaitingContainedResponse,
      isSubmittable,
      isSubmitted,
      isProjectTemplateLevel,
      handleClearPuzzle,
      canRun,
      canTest,
      onPhotoPrompterFileSelected
    } = this.props;

    if (displayTheme === DisplayTheme.DARK) {
      document.body.style.backgroundColor = color.background_black;
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
                onPhotoPrompterFileSelected={onPhotoPrompterFileSelected}
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
                    disableRunButton={awaitingContainedResponse || !canRun}
                    disableTestButton={awaitingContainedResponse || !canTest}
                    onContinue={() => onContinue(isSubmittable)}
                    renderSettings={this.renderSettings}
                    showTestButton={
                      isEditingStartSources ||
                      experiments.isEnabled(experiments.JAVALAB_UNIT_TESTS)
                    }
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
    displayTheme: state.javalab.displayTheme,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    isTesting: state.javalab.isTesting,
    canRun: !state.javalab.isTesting,
    canTest: !state.javalab.isRunning,
    showProjectTemplateWorkspaceIcon: !!state.pageConstants
      .showProjectTemplateWorkspaceIcon,
    editorColumnHeight: state.javalab.editorColumnHeight,
    longInstructions: state.instructions.longInstructions,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    disableFinishButton: state.javalab.disableFinishButton,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setDisplayTheme: displayTheme => dispatch(setDisplayTheme(displayTheme)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
    setIsTesting: isTesting => dispatch(setIsTesting(isTesting))
  })
)(UnconnectedJavalabView);
