import React from 'react';
import JavalabConsole from './JavalabConsole';
import {connect} from 'react-redux';
import JavalabEditor from './JavalabEditor';
import JavalabSettings from './JavalabSettings';
import {appendOutputLog, setIsDarkMode} from './javalabRedux';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import VisualizationResizeBar from '@cdo/apps/lib/ui/VisualizationResizeBar';

class JavalabView extends React.Component {
  static propTypes = {
    handleVersionHistory: PropTypes.func.isRequired,
    onMount: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    onInputMessage: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,
    visualization: PropTypes.object.isRequired,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    setIsDarkMode: PropTypes.func,
    channelId: PropTypes.string
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
    const {isDarkMode} = this.props;
    return [
      <a
        onClick={() => this.props.setIsDarkMode(!isDarkMode)}
        key="theme-setting"
      >
        Switch to {isDarkMode ? 'light mode' : 'dark mode'}
      </a>
    ];
  };

  getButtonStyles = isSettingsButton => {
    const {isDarkMode} = this.props;
    if (isDarkMode) {
      return styles.singleButton;
    } else if (isSettingsButton) {
      return {...styles.singleButton, backgroundColor: color.orange};
    } else {
      return {...styles.singleButton, backgroundColor: color.cyan};
    }
  };

  render() {
    const {
      isDarkMode,
      onCommitCode,
      onContinue,
      onRun,
      onInputMessage,
      handleVersionHistory,
      visualization
    } = this.props;
    if (isDarkMode) {
      document.body.style.backgroundColor = '#1b1c17';
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }
    return (
      <StudioAppWrapper>
        <div style={styles.javalab}>
          <div
            id="visualizationColumn"
            className="responsive"
            style={styles.instructionsAndPreview}
          >
            <TopInstructions mainStyle={styles.instructions} standalone />
            <div style={styles.preview}>{visualization}</div>
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
            <div style={styles.consoleAndButtons}>
              <div style={styles.buttons}>
                <button
                  type="button"
                  style={this.getButtonStyles(false)}
                  onClick={() => {}}
                >
                  <FontAwesome icon="stop" className="fa-2x" />
                  <br />
                  Stop
                </button>
                <button
                  type="button"
                  style={this.getButtonStyles(false)}
                  onClick={onContinue}
                >
                  <FontAwesome icon="check" className="fa-2x" />
                  <br />
                  Continue
                </button>
              </div>
              <div style={styles.buttons}>
                <JavalabSettings
                  style={this.getButtonStyles(true /* isSettingsButton */)}
                >
                  {this.renderSettings()}
                </JavalabSettings>
                <button
                  type="button"
                  style={this.getButtonStyles(false)}
                  onClick={onRun}
                >
                  <FontAwesome icon="play" className="fa-2x" />
                  <br />
                  Run
                </button>
              </div>
              <div style={styles.consoleStyle}>
                <JavalabConsole onInputMessage={onInputMessage} />
              </div>
            </div>
          </div>
        </div>
      </StudioAppWrapper>
    );
  }
}

const styles = {
  instructionsAndPreview: {
    width: '100%',
    position: 'absolute',
    marginRight: 15,
    color: color.black,
    right: '15px',
    top: '15px'
  },
  instructions: {
    width: '100%',
    position: 'relative',
    marginLeft: 0,
    color: color.black,
    left: 0
  },
  editorAndConsole: {
    position: 'absolute',
    right: '15px',
    marginLeft: '15px'
  },
  preview: {
    backgroundColor: color.light_gray,
    height: '200px',
    marginTop: '13px'
  },
  javalab: {
    display: 'flex',
    margin: 15
  },
  consoleAndButtons: {
    marginTop: 15,
    display: 'flex'
  },
  consoleStyle: {
    flexGrow: 1
  },
  buttons: {
    marginRight: 15,
    height: 75,
    display: 'flex',
    flexDirection: 'column'
  },
  singleButton: {
    // this matches the current code mirror theme we are using
    // TODO: either add to color.scss or use a color from there depending
    // on final theme choice.
    backgroundColor: color.darkest_gray,
    color: color.white,
    width: 95,
    textAlign: 'center'
  },
  clear: {
    clear: 'both'
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
