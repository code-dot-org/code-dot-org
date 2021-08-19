import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import {
  appendOutputLog,
  setIsDarkMode,
  setIsRunning,
  setLeftWidth,
  setRightWidth,
  setInstructionsHeight,
  setInstructionsFullHeight,
  setConsoleHeight,
  setEditorColumnHeight
} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions, {
  TabType
} from '@cdo/apps/templates/instructions/TopInstructions';
import {VIEWING_CODE_REVIEW_URL_PARAM} from '@cdo/apps/templates/instructions/ReviewTab';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';
import ControlButtons from './ControlButtons';
import {CsaViewMode} from './constants';
import styleConstants from '../styleConstants';
import _ from 'lodash';
import {queryParams} from '@cdo/apps/code-studio/utils';

// The top Y coordinate of the JavaLab panels.  Above them is just the common site
// header and then a bit of empty space.
const PANELS_TOP_COORDINATE = 60;

class JavalabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object,
    viewMode: PropTypes.string.isRequired,

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
    setLeftWidth: PropTypes.func,
    setRightWidth: PropTypes.func,
    setInstructionsHeight: PropTypes.func,
    setInstructionsFullHeight: PropTypes.func,
    setConsoleHeight: PropTypes.func,
    setEditorColumnHeight: PropTypes.func,
    leftWidth: PropTypes.number,
    rightWidth: PropTypes.number,
    instructionsHeight: PropTypes.number,
    instructionsFullHeight: PropTypes.number,
    instructionsRenderedHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    consoleHeight: PropTypes.number,
    editorColumnHeight: PropTypes.number,
    awaitingContainedResponse: PropTypes.bool,
    isVisualizationCollapsed: PropTypes.bool,
    isInstructionsCollapsed: PropTypes.bool,
    isSubmittable: PropTypes.bool,
    isSubmitted: PropTypes.bool
  };

  state = {
    isTesting: false
  };

  componentDidMount() {
    this.props.onMount();
    this.updateLayout(this.props.leftWidth);
    window.addEventListener('resize', () =>
      this.updateLayoutThrottled(this.props.leftWidth)
    );
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () =>
        this.updateLayoutThrottled(this.props.leftWidth)
      );
    }
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

  renderVisualization = () => {
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
          width: this.props.leftWidth + styleConstants['resize-bar-width']
        }}
      >
        &nbsp;
      </div>
    );
  };

  handleWidthResize = desiredWidth => {
    const leftWidthMin = 200;
    const leftWidthMax = 600;
    let newWidth = Math.max(leftWidthMin, Math.min(desiredWidth, leftWidthMax));
    this.props.setLeftWidth(newWidth);

    this.updateLayoutThrottled(newWidth);
  };

  handleInstructionsHeightResize = desiredHeight => {
    // The max height of the instructions isn't too important to get right, because
    // we don't allow the instructions to exceed available space in getInstructionsHeight.
    const instructionsHeightMin = 100;
    const instructionsHeightMax = window.innerHeight - 100;

    let newHeight = Math.max(
      instructionsHeightMin,
      Math.min(desiredHeight, instructionsHeightMax)
    );
    this.props.setInstructionsHeight(newHeight);

    this.updateLayoutThrottled(this.props.leftWidth);
  };

  handleEditorHeightResize = desiredHeight => {
    // While the horizontal resizer thinks it's resizing the content above it, which
    // is the editor panel, we are actually storing the size of the console below it.
    // That way, if the window resizes, the console stays the same height while the editor
    // changes in height.

    const consoleDesiredHeight = this.props.editorColumnHeight - desiredHeight;

    const consoleHeightMin = 200;
    const consoleHeightMax = window.innerHeight - 200;

    let newHeight = Math.max(
      consoleHeightMin,
      Math.min(consoleDesiredHeight, consoleHeightMax)
    );

    this.props.setConsoleHeight(newHeight);
  };

  getInstructionsHeight = () => {
    if (this.props.isInstructionsCollapsed) {
      return 30;
    } else if (
      this.props.isVisualizationCollapsed ||
      !this.props.visualization
    ) {
      return this.props.instructionsFullHeight;
    } else {
      return Math.min(
        this.props.instructionsHeight,
        this.props.instructionsFullHeight
      );
    }
  };

  getEditorHeight = () => {
    // Determine the editor height, but do it based on the console height.
    return this.props.editorColumnHeight - this.props.consoleHeight;
  };

  shouldShowInstructionsHeightResizer = () => {
    return (
      !this.props.isInstructionsCollapsed &&
      !this.props.isVisualizationCollapsed &&
      this.props.visualization
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

  updateLayout = availableWidth => {
    // We scale the visualization to take up as much space as it can, both
    // vertically and horizontally.  Its width is constrained by the width
    // of the left side, which the user can adjust by dragging a resizer, and
    // which is passed into this function as availableWidth.
    // Its height is constrained by how much of the window is available.  We
    // start with the entire height of the window, subtract the space used by
    // the instructions (which includes their header and horizontal resizer),
    // subtract the space used by misc existing elements (which includes the
    // page header, gaps between areas, the "preview" header, and the small
    // footer at the bottom), and subtract the space used by the speed slider
    // if it's shown.
    // The visualization is a square, so the width it's rendered at will be
    // constrained by both the available width and height.
    const miscExistingElementsHeight = 150;
    const sliderHeight = 60;

    // The original visualization is rendered at 800x800.
    const originalVisualizationWidth = 800;

    // Determine the available height.
    let availableHeight =
      window.innerHeight -
      this.props.instructionsHeight -
      miscExistingElementsHeight;
    if (this.props.viewMode === CsaViewMode.NEIGHBORHOOD) {
      availableHeight -= sliderHeight;
    }

    // Use the biggest available size.
    let newVisualizationWidth = Math.min(availableHeight, availableWidth);

    // Scale the visualization.
    let scale = newVisualizationWidth / originalVisualizationWidth;
    if (scale < 0) {
      // Avoid inverting.
      scale = 0;
    }
    const scaleCss = `scale(${scale})`;
    switch (this.props.viewMode) {
      case CsaViewMode.NEIGHBORHOOD:
        $('#svgMaze').css('transform', scaleCss);
        break;
      case CsaViewMode.THEATER:
        $('#theater-container').css('transform', scaleCss);
        break;
      case CsaViewMode.PLAYGROUND:
        $('#playground-container').css('transform', scaleCss);
        break;
    }

    // Size the visualization div (which will actually set the rendered
    // width of the left side of the screen, since this div determines its
    // size) and center the visualization inside of it.
    $('#visualization').css({
      'max-width': availableWidth,
      'max-height': newVisualizationWidth,
      height: newVisualizationWidth,
      'margin-left': (availableWidth - newVisualizationWidth) / 2
    });

    // Also adjust the width of the small footer at the bottom.
    $('#page-small-footer .small-footer-base').css(
      'max-width',
      availableWidth - styleConstants['resize-bar-width']
    );

    this.props.setInstructionsFullHeight(
      window.innerHeight - miscExistingElementsHeight
    );

    this.props.setEditorColumnHeight(
      window.innerHeight - PANELS_TOP_COORDINATE
    );

    // The right width can also change at this point, since it takes up the
    // remaining space.
    const actualLeftWidth = this.isLeftSideVisible()
      ? this.props.leftWidth + styleConstants['resize-bar-width']
      : 0;
    const newRightWidth = window.innerWidth - actualLeftWidth - 20;
    this.props.setRightWidth(newRightWidth);
  };

  updateLayoutThrottled = _.throttle(this.updateLayout, 33);

  render() {
    const {
      isDarkMode,
      onCommitCode,
      onInputMessage,
      onContinue,
      handleVersionHistory,
      isEditingStartSources,
      isRunning,
      showProjectTemplateWorkspaceIcon,
      disableFinishButton,
      editorColumnHeight,
      leftWidth,
      rightWidth,
      awaitingContainedResponse,
      isSubmittable,
      isSubmitted
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
          <div style={styles.editorAndVisualization}>
            <div
              id="visualizationColumn"
              className="responsive"
              style={{...styles.instructionsAndPreview, maxWidth: leftWidth}}
            >
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
                explicitHeight={this.getInstructionsHeight()}
                resizable={false}
              />
              {this.shouldShowInstructionsHeightResizer() && (
                <HeightResizer
                  resizeItemTop={() => PANELS_TOP_COORDINATE}
                  position={
                    this.getInstructionsHeight() +
                    styleConstants['resize-bar-width']
                  }
                  onResize={this.handleInstructionsHeightResize}
                />
              )}
              {this.isLeftSideVisible() && this.renderVisualization()}
            </div>

            {this.isLeftSideVisible() && (
              <HeightResizer
                vertical={true}
                resizeItemTop={() => 10}
                position={
                  this.props.leftWidth + styleConstants['resize-bar-width']
                }
                onResize={this.handleWidthResize}
              />
            )}

            <div
              style={{
                ...(this.isLeftSideVisible()
                  ? styles.editorAndConsole
                  : styles.editorAndConsoleOnly),
                color: isDarkMode ? color.white : color.black,
                height: editorColumnHeight,
                width: rightWidth
              }}
              className="editor-column"
            >
              <JavalabEditor
                onCommitCode={onCommitCode}
                handleVersionHistory={handleVersionHistory}
                showProjectTemplateWorkspaceIcon={
                  showProjectTemplateWorkspaceIcon
                }
                height={this.getEditorHeight()}
              />

              <HeightResizer
                resizeItemTop={() => PANELS_TOP_COORDINATE}
                position={
                  this.getEditorHeight() + styleConstants['resize-bar-width']
                }
                onResize={this.handleEditorHeightResize}
                style={styles.rightResizer}
              />

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
            </div>
          </div>
        </div>
      </StudioAppWrapper>
    );
  }
}

const styles = {
  instructionsAndPreview: {
    color: color.black,
    right: '15px'
  },
  instructions: {
    width: '100%',
    position: 'relative',
    marginLeft: 0,
    color: color.black,
    left: 0
  },
  editorAndConsole: {
    right: '15px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: styleConstants['resize-bar-width']
  },
  editorAndConsoleOnly: {
    right: '15px',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  consoleParent: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexGrow: 1,
    overflowY: 'hidden'
  },
  editorAndVisualization: {
    display: 'flex',
    flexGrow: '1',
    height: '100%'
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
  },
  rightResizer: {
    position: 'static'
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
    leftWidth: state.javalab.leftWidth,
    rightWidth: state.javalab.rightWidth,
    instructionsHeight: state.javalab.instructionsHeight,
    instructionsFullHeight: state.javalab.instructionsFullHeight,
    instructionsRenderedHeight: state.instructions.renderedHeight,
    longInstructions: state.instructions.longInstructions,
    consoleHeight: state.javalab.consoleHeight,
    editorColumnFullHeight: state.javalab.editorColumnFullHeight,
    awaitingContainedResponse: state.runState.awaitingContainedResponse,
    isVisualizationCollapsed: state.javalab.isVisualizationCollapsed,
    isInstructionsCollapsed: state.instructions.isCollapsed,
    disableFinishButton: state.javalab.disableFinishButton,
    isSubmittable: state.pageConstants.isSubmittable,
    isSubmitted: state.pageConstants.isSubmitted
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
    setLeftWidth: width => dispatch(setLeftWidth(width)),
    setRightWidth: width => dispatch(setRightWidth(width)),
    setInstructionsHeight: height => dispatch(setInstructionsHeight(height)),
    setInstructionsFullHeight: height =>
      dispatch(setInstructionsFullHeight(height)),
    setConsoleHeight: height => dispatch(setConsoleHeight(height)),
    setEditorColumnHeight: height => dispatch(setEditorColumnHeight(height))
  })
)(UnconnectedJavalabView);
