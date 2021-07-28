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
  setLeftWidth
} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import HeightResizer from '@cdo/apps/templates/instructions/HeightResizer';
import ControlButtons from './ControlButtons';
import {getStore} from '../redux';
import {setVisualizationScale} from '../redux/layout';
import _ from 'lodash';

const FOOTER_BUFFER = 10;

class JavalabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object,
    editorColumnHeight: PropTypes.number,
    appType: PropTypes.string,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    setIsDarkMode: PropTypes.func,
    channelId: PropTypes.string,
    isEditingStartSources: PropTypes.bool,
    isRunning: PropTypes.bool,
    setIsRunning: PropTypes.func,
    showProjectTemplateWorkspaceIcon: PropTypes.bool.isRequired,
    setLeftWidth: PropTypes.func,
    leftWidth: PropTypes.number,
    topInstructionsHeight: PropTypes.number.isRequired
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

  // This controls the 'run' button state, but stopping program execution is not yet
  // implemented and will need to be added here.
  toggleRun = () => {
    const toggledIsRunning = !this.props.isRunning;
    this.props.setIsRunning(toggledIsRunning);
    if (toggledIsRunning) {
      this.props.onRun();
    } else {
      // TODO: Stop program execution.
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

    // This workaround is necessary because <VisualizationResizeBar /> requires
    // an element with ID 'visualization' or it will not resize.
    return (
      <div
        id="visualization"
        style={{
          margin: '0 auto',
          height: this.props.leftWidth,
          maxWidth: undefined,
          maxHeight: undefined
        }}
      />
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

  updateLayout = width => {
    const visualizationColumnHeight = $(window).height() - 135;
    const visualizationTop = this.props.topInstructionsHeight;
    const sliderHeight = 60;
    let constrainVisualizationWidth =
      visualizationColumnHeight - visualizationTop;
    if (this.props.appType === 'neighborhood') {
      constrainVisualizationWidth -= sliderHeight;
    }
    let newVizWidth = Math.min(constrainVisualizationWidth, width);

    let scale = newVizWidth / 800;
    if (scale < 0) {
      // Avoiding inverting.
      scale = 0;
    }
    getStore().dispatch(setVisualizationScale(scale));

    const cssScale = `scale(${scale})`;

    if (this.props.appType === 'neighborhood') {
      $('#svgMaze').css('transform', cssScale);
    } else if (this.props.appType === 'theater') {
      $('#theater-container').css('transform', cssScale);
    }

    const cssWidth = width + 'px';
    const newcssWidth = newVizWidth + 'px';
    $('#visualization').css({
      'max-width': cssWidth,
      'max-height': newcssWidth,
      height: newcssWidth,
      left: (width - newVizWidth) / 2 + 'px'
    });

    $('#page-small-footer .small-footer-base').css('max-width', width - 13);
  };

  updateLayoutThrottled = _.throttle(this.updateLayout, 200);

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
      isReadOnlyWorkspace,
      editorColumnHeight,
      leftWidth
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
                displayDocumentationTab
                displayReviewTab
                onHeightResize={() => this.updateLayoutThrottled(leftWidth)}
              />
              {this.renderVisualization()}
            </div>

            {this.props.appType !== 'console' && (
              <HeightResizer
                vertical={true}
                resizeItemTop={() => 10}
                position={this.props.leftWidth + 13}
                onResize={this.handleWidthResize}
              />
            )}

            <div
              style={{
                ...(this.props.appType === 'console'
                  ? styles.editorAndConsoleOnly
                  : styles.editorAndConsole),
                color: isDarkMode ? color.white : color.black,
                height: editorColumnHeight
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
                style={styles.consoleParent}
                bottomRow={
                  <ControlButtons
                    isRunning={isRunning}
                    isDarkMode={isDarkMode}
                    isTesting={isTesting}
                    toggleRun={this.toggleRun}
                    toggleTest={this.toggleTest}
                    isEditingStartSources={isEditingStartSources}
                    isReadOnlyWorkspace={isReadOnlyWorkspace}
                    onContinue={onContinue}
                    renderSettings={this.renderSettings}
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
    marginLeft: 13
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
  preview: {
    marginTop: '13px'
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
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    channelId: state.pageConstants.channelId,
    isDarkMode: state.javalab.isDarkMode,
    isEditingStartSources: state.pageConstants.isEditingStartSources,
    isRunning: state.javalab.isRunning,
    showProjectTemplateWorkspaceIcon: !!state.pageConstants
      .showProjectTemplateWorkspaceIcon,
    editorColumnHeight: state.javalab.editorColumnHeight,
    leftWidth: state.javalab.leftWidth,
    topInstructionsHeight: state.instructions.renderedHeight
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode)),
    setIsRunning: isRunning => dispatch(setIsRunning(isRunning)),
    setLeftWidth: width => dispatch(setLeftWidth(width))
  })
)(UnconnectedJavalabView);
