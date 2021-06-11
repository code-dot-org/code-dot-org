import React from 'react';
import PropTypes from 'prop-types';
import i18n from '@cdo/locale';
import {connect} from 'react-redux';
import color from '@cdo/apps/util/color';
import JavalabConsole from './JavalabConsole';
import JavalabEditor from './JavalabEditor';
import JavalabSettings from './JavalabSettings';
import {appendOutputLog, setIsDarkMode} from './javalabRedux';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import VisualizationResizeBar from '@cdo/apps/lib/ui/VisualizationResizeBar';
import ControlButtons from './ControlButtons';
import JavalabButton from './JavalabButton';

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

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    setIsDarkMode: PropTypes.func,
    channelId: PropTypes.string
  };

  constructor(props) {
    super(props);

    this.setHeaderHeight = this.setHeaderHeight.bind(this);

    this.state = {
      isRunning: false,
      isTesting: false,
      headerHeight: 800
    };
  }

  componentDidMount() {
    this.props.onMount();
    this.setHeaderHeight();
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
    this.setState(
      state => ({isRunning: !state.isRunning}),
      () => {
        if (this.state.isRunning) {
          this.props.onRun();
        } else {
          // TODO: Stop program execution.
        }
      }
    );
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
      return <div style={styles.preview}>{visualization}</div>;
    }

    // This workaround is necessary because <VisualizationResizeBar /> requires
    // an element with ID 'visualization' or it will not resize.
    return <div id="visualization" />;
  };

  setHeaderHeight = () => {
    let editorAndVisualization = document.getElementById('editor-and-vis-div');
    let headerHeight = editorAndVisualization.getBoundingClientRect().top;
    let topPos = window.innerHeight - headerHeight - FOOTER_BUFFER;
    this.setState({
      headerHeight: topPos
    });
  };

  render() {
    const {
      isDarkMode,
      onCommitCode,
      onInputMessage,
      onContinue,
      handleVersionHistory
    } = this.props;
    const {isRunning, isTesting, headerHeight} = this.state;

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
            ...{height: headerHeight}
          }}
        >
          <div style={styles.buttons}>
            <JavalabSettings>{this.renderSettings()}</JavalabSettings>
            <JavalabButton
              text={i18n.finish()}
              onClick={onContinue}
              style={styles.finish}
            />
          </div>
          <div id="editor-and-vis-div" style={styles.editorAndVisualization}>
            <div
              id="visualizationColumn"
              className="responsive"
              style={styles.instructionsAndPreview}
            >
              <TopInstructions
                mainStyle={styles.instructions}
                standalone
                displayDocumentationTab
                displayReviewTab
              />
              {this.renderVisualization()}
            </div>
            <VisualizationResizeBar />
            <div
              style={{
                ...styles.editorAndConsole,
                color: isDarkMode ? color.white : color.black
              }}
              className="editor-column"
            >
              <JavalabEditor
                onCommitCode={onCommitCode}
                handleVersionHistory={handleVersionHistory}
              />
              <JavalabConsole
                onInputMessage={onInputMessage}
                style={styles.consoleParent}
                leftColumn={
                  <ControlButtons
                    isDarkMode={isDarkMode}
                    isRunning={isRunning}
                    isTesting={isTesting}
                    toggleRun={this.toggleRun}
                    toggleTest={this.toggleTest}
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
    display: 'flex',
    flexDirection: 'column'
  },
  consoleParent: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  editorAndVisualization: {
    display: 'flex',
    flexGrow: '1',
    height: '100%'
  },
  preview: {
    backgroundColor: color.light_gray,
    height: '200px',
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
    margin: '10px 0'
  },
  finish: {
    backgroundColor: color.orange,
    borderColor: color.orange,
    fontFamily: '"Gotham 5r"',
    fontSize: '15px',
    padding: '1px 8px',
    margin: '5px 0 5px 5px'
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
    isDarkMode: state.javalab.isDarkMode
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    setIsDarkMode: isDarkMode => dispatch(setIsDarkMode(isDarkMode))
  })
)(UnconnectedJavalabView);
