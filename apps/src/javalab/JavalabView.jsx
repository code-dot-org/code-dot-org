import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {VIEWING_CODE_REVIEW_URL_PARAM} from '@cdo/apps/templates/instructions/CommitsAndReviewTab';
import TopInstructions, {
  TabType,
} from '@cdo/apps/templates/instructions/TopInstructions';
import {hasInstructions} from '@cdo/apps/templates/instructions/utils';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

import styleConstants from '../styleConstants';

import {CsaViewMode} from './constants';
import ControlButtons from './ControlButtons';
import {DisplayTheme} from './DisplayTheme';
import JavalabCaptchaDialog from './JavalabCaptchaDialog';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import JavalabPanels from './JavalabPanels';
import {appendOutputLog} from './redux/consoleRedux';
import {setIsRunning, setIsTesting} from './redux/javalabRedux';
import {setDisplayTheme} from './redux/viewRedux';

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
    isCodeReviewing: PropTypes.bool,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
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
    longInstructions: PropTypes.string,
    hasContainedLevels: PropTypes.bool,
    awaitingContainedResponse: PropTypes.bool,
    isSubmittable: PropTypes.bool,
    isSubmitted: PropTypes.bool,
    validationPassed: PropTypes.bool,
    hasRunOrTestedCode: PropTypes.bool,
    hasOpenCodeReview: PropTypes.bool,
    isJavabuilderConnecting: PropTypes.bool,
  };

  componentDidMount() {
    this.props.onMount();
  }

  compile = () => {
    this.props.appendOutputLog(javalabMsg.compilingProgram());
    this.props.appendOutputLog(javalabMsg.compiled());
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
    // It's possible that a console level without instructions won't have
    // anything to show on the left side.
    return (
      this.props.viewMode !== CsaViewMode.CONSOLE || this.hasInstructions()
    );
  };

  hasInstructions = () => {
    const {longInstructions, hasContainedLevels} = this.props;
    return hasInstructions(null, longInstructions, hasContainedLevels);
  };

  renderVisualization = width => {
    const {visualization} = this.props;
    if (visualization) {
      const previewStyle = this.hasInstructions() ? styles.preview : {};
      return (
        <div id="visualization-container" style={previewStyle}>
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
          width: width + styleConstants['resize-bar-width'],
        }}
      >
        &nbsp;
      </div>
    );
  };

  onCaptchaVerify = () => {
    const {isRunning, isTesting, onRun, onTest} = this.props;
    if (isRunning) {
      onRun();
    }
    if (isTesting) {
      onTest();
    }
  };

  onCaptchaCancel = () => {
    const {isRunning, isTesting, setIsRunning, setIsTesting} = this.props;
    if (isRunning) {
      setIsRunning(false);
    }
    if (isTesting) {
      setIsTesting(false);
    }
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
      awaitingContainedResponse,
      isSubmittable,
      isSubmitted,
      isProjectTemplateLevel,
      handleClearPuzzle,
      canRun,
      canTest,
      onPhotoPrompterFileSelected,
      isCodeReviewing,
      validationPassed,
      hasRunOrTestedCode,
      hasOpenCodeReview,
      isJavabuilderConnecting,
    } = this.props;

    if (displayTheme === DisplayTheme.DARK) {
      document.body.style.backgroundColor = color.background_black;
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }

    // The finish button is disabled if any of the following are true:
    // 1. The user has not clicked 'run' or test' yet for this session.
    // 2. This is the user's code and they have opened it for code review.
    // 4. This is a peer's code, which the current user is code reviewing.
    // 5. Validation has not passed (if validation does not exist, validationPassed will be true)
    const disableFinishButton =
      !hasRunOrTestedCode ||
      !!hasOpenCodeReview ||
      !!isCodeReviewing ||
      !validationPassed;

    const finishButtonTooltipText = validationPassed
      ? null
      : javalabMsg.testsNotPassing();

    return (
      <StudioAppWrapper>
        <div
          style={{
            ...styles.javalab,
          }}
        >
          <JavalabCaptchaDialog
            onVerify={this.onCaptchaVerify}
            onCancel={this.onCaptchaCancel}
          />
          <JavalabPanels
            isLeftSideVisible={this.isLeftSideVisible()}
            viewMode={viewMode}
            visualization={visualization}
            topLeftPanel={height => (
              <TopInstructions
                mainStyle={styles.instructions}
                isOldPurpleColorHeader
                standalone
                displayDocumentationTab
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
                height={height}
                isProjectTemplateLevel={isProjectTemplateLevel}
                handleClearPuzzle={handleClearPuzzle}
                viewMode={viewMode}
              />
            )}
            bottomRightPanel={() => (
              <JavalabConsole
                onInputMessage={onInputMessage}
                onPhotoPrompterFileSelected={onPhotoPrompterFileSelected}
                style={{
                  ...styles.consoleParent,
                  ...(!this.isLeftSideVisible() && {paddingBottom: 40}),
                }}
                bottomRow={
                  <ControlButtons
                    isRunning={isRunning}
                    isTesting={isTesting}
                    toggleRun={this.toggleRun}
                    toggleTest={this.toggleTest}
                    isEditingStartSources={isEditingStartSources}
                    disableFinishButton={disableFinishButton}
                    disableRunButton={
                      awaitingContainedResponse ||
                      !canRun ||
                      isJavabuilderConnecting
                    }
                    disableTestButton={
                      awaitingContainedResponse ||
                      !canTest ||
                      isJavabuilderConnecting
                    }
                    onContinue={() => onContinue(isSubmittable)}
                    showTestButton={true}
                    isSubmittable={isSubmittable}
                    isSubmitted={isSubmitted}
                    finishButtonTooltipText={finishButtonTooltipText}
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
    left: 0,
  },
  consoleParent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexGrow: 1,
    overflowY: 'hidden',
  },
  visualizationPlaceholder: {
    height: 1,
    maxWidth: undefined,
    maxHeight: undefined,
    marginTop: styleConstants['resize-bar-width'],
  },
  preview: {
    marginTop: styleConstants['resize-bar-width'],
  },
  javalab: {
    display: 'flex',
    flexWrap: 'wrap',
    direction: 'ltr',
  },
  clear: {
    clear: 'both',
  },
  buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    margin: '10px 0',
    overflowY: 'hidden',
  },
};

// Exported for tests
export const UnconnectedJavalabView = JavalabView;

export default connect(
  state => ({
    isProjectLevel: state.pageConstants.isProjectLevel,
    channelId: state.pageConstants.channelId,
    displayTheme: state.javalabView.displayTheme,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    isTesting: state.javalab.isTesting,
    canRun: !state.javalab.isTesting,
    canTest: !state.javalab.isRunning,
    editorColumnHeight: state.javalabView.editorColumnHeight,
    longInstructions: state.instructions.longInstructions,
    hasContainedLevels: state.pageConstants.hasContainedLevels,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted,
    isCodeReviewing: state.pageConstants.isCodeReviewing,
    validationPassed: state.javalab.validationPassed,
    hasRunOrTestedCode: state.javalab.hasRunOrTestedCode,
    hasOpenCodeReview: state.javalab.hasOpenCodeReview,
    isJavabuilderConnecting: state.javalab.isJavabuilderConnecting,
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setDisplayTheme: displayTheme => dispatch(setDisplayTheme(displayTheme)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
    setIsTesting: isTesting => dispatch(setIsTesting(isTesting)),
  })
)(UnconnectedJavalabView);
