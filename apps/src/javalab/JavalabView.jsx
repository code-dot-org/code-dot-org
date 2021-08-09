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
  setRightWidth
} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';
import ControlButtons from './ControlButtons';
import {CsaViewMode} from './constants';
import styleConstants from '../styleConstants';
import _ from 'lodash';

const FOOTER_BUFFER = 10;

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
    editorColumnHeight: PropTypes.number,
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
    leftWidth: PropTypes.number,
    rightWidth: PropTypes.number,
    topInstructionsHeight: PropTypes.number.isRequired,
    longInstructions: PropTypes.string,
    awaitingContainedResponse: PropTypes.bool
  };

  state = {
    isTesting: false,
    rightContainerHeight: 800
  };

  componentDidMount() {
    this.props.onMount();
    this.setRightContainerHeight();
    this.updateLayout(this.props.leftWidth);
    window.addEventListener('resize', () =>
      this.updateLayoutThrottled(this.props.leftWidth)
    );
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

  setRightContainerHeight = () => {
    let rightContainerHeight = this.editorAndVisualization.getBoundingClientRect()
      .top;
    let topPos = window.innerHeight - rightContainerHeight - FOOTER_BUFFER;
    this.setState({
      rightContainerHeight: topPos
    });
  };

  handleWidthResize = desiredWidth => {
    let newWidth = Math.max(100, Math.min(desiredWidth, 600));
    this.props.setLeftWidth(newWidth);

    this.updateLayoutThrottled(newWidth);
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
    const miscExistingElementsHeight = 135;
    const sliderHeight = 60;

    // The original visualization is rendered at 800x800.
    const originalVisualizationWidth = 800;

    // Determine the available height.
    let availableHeight =
      window.innerHeight -
      this.props.topInstructionsHeight -
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
    if (this.props.viewMode === CsaViewMode.NEIGHBORHOOD) {
      $('#svgMaze').css('transform', scaleCss);
    } else if (this.props.viewMode === CsaViewMode.THEATER) {
      $('#theater-container').css('transform', scaleCss);
    }

    // Size the visualization div (which will actually set the rendered
    // width of the left side of the screen, since this div determines its
    // size) and center the visualization inside of it.
    $('#visualization').css({
      'max-width': availableWidth,
      'max-height': newVisualizationWidth,
      height: newVisualizationWidth,
      left: (availableWidth - newVisualizationWidth) / 2
    });

    // Also adjust the width of the small footer at the bottom.
    $('#page-small-footer .small-footer-base').css(
      'max-width',
      availableWidth - styleConstants['resize-bar-width']
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

  isLeftSideVisible = () => {
    // It's possible that a console level without instructions won't have
    // anything to show on the left side.
    return (
      this.props.viewMode !== CsaViewMode.CONSOLE ||
      !!this.props.longInstructions
    );
  };

  componentDidUpdate(prevProps) {
    if (prevProps.topInstructionsHeight !== this.props.topInstructionsHeight) {
      this.updateLayoutThrottled(this.props.leftWidth);
    }
  }

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
      awaitingContainedResponse
    } = this.props;
    const {isTesting, rightContainerHeight} = this.state;

    if (isDarkMode) {
      document.body.style.backgroundColor = '#1b1c17';
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }

    return (
      <StudioAppWrapper>
        <div
          style={{
            ...styles.javalab,
            ...{height: rightContainerHeight}
          }}
        >
          <div
            ref={ref => (this.editorAndVisualization = ref)}
            style={styles.editorAndVisualization}
          >
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
                onHeightResize={() => this.updateLayoutThrottled(leftWidth)}
              />
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
                    onContinue={onContinue}
                    renderSettings={this.renderSettings}
                    showTestButton={false}
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
    flexWrap: 'wrap'
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
    disableFinishButton: state.javalab.disableFinishButton,
    channelId: state.pageConstants.channelId,
    isDarkMode: state.javalab.isDarkMode,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    showProjectTemplateWorkspaceIcon: !!state.pageConstants
      .showProjectTemplateWorkspaceIcon,
    editorColumnHeight: state.javalab.editorColumnHeight,
    leftWidth: state.javalab.leftWidth,
    rightWidth: state.javalab.rightWidth,
    topInstructionsHeight: state.instructions.renderedHeight,
    longInstructions: state.instructions.longInstructions,
    awaitingContainedResponse: state.runState.awaitingContainedResponse
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
    setLeftWidth: width => dispatch(setLeftWidth(width)),
    setRightWidth: width => dispatch(setRightWidth(width))
  })
)(UnconnectedJavalabView);
