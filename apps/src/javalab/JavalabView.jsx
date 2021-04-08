import React from 'react';
import JavalabConsole from './JavalabConsole';
import {loadFiles} from './JavalabFileManagement';
import {connect} from 'react-redux';
import JavalabEditor from './JavalabEditor';
import JavalabSettings from './JavalabSettings';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {appendOutputLog, toggleDarkMode} from './javalabRedux';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';
import project from '@cdo/apps/code-studio/initApp/project';

const style = {
  instructionsAndPreview: {
    width: '40%',
    position: 'relative',
    marginRight: 15,
    color: color.black
  },
  editorAndConsole: {
    width: '60%',
    position: 'relative'
  },
  preview: {
    backgroundColor: color.light_gray,
    height: '200px'
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
    backgroundColor: '#272822',
    color: color.white,
    width: 95,
    textAlign: 'center'
  },
  clear: {
    clear: 'both'
  }
};

class JavalabView extends React.Component {
  static propTypes = {
    onMount: PropTypes.func.isRequired,
    onContinue: PropTypes.func.isRequired,
    onCommitCode: PropTypes.func.isRequired,
    suppliedFilesVersionId: PropTypes.string,

    // populated by redux
    isProjectLevel: PropTypes.bool.isRequired,
    isReadOnlyWorkspace: PropTypes.bool.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    appendOutputLog: PropTypes.func,
    toggleDarkMode: PropTypes.func,
    channelId: PropTypes.string
  };

  state = {
    loading: true,
    loadSuccess: null
  };

  componentDidMount() {
    this.props.onMount();
    loadFiles(
      /* success */
      () => this.setState({loading: false, loadSuccess: true}),
      /* failure */
      () => this.setState({loading: false, loadSuccess: false}),
      this.props.suppliedFilesVersionId
    );
    this.getToken();
  }

  getToken = () => {
    // TODO: Use token to connect to Java Builder
    $.ajax({
      url: '/javabuilder/access_token',
      type: 'get',
      data: {
        channelId: this.props.channelId,
        projectVersion: project.getCurrentSourceVersionId()
      }
    })
      .done()
      .fail();
  };

  run = () => {
    this.props.appendOutputLog('Running program...');
    this.props.appendOutputLog('Hello world!');
  };

  compile = () => {
    this.props.appendOutputLog('Compiling program...');
    this.props.appendOutputLog('Compiled!');
  };

  renderSettings = () => {
    const {isDarkMode} = this.props;
    return [
      <a onClick={this.props.toggleDarkMode}>
        Switch to {isDarkMode ? 'light mode' : 'dark mode'}
      </a>
    ];
  };

  getButtonStyles = isSettingsButton => {
    const {isDarkMode} = this.props;
    if (isDarkMode) {
      return style.singleButton;
    } else if (isSettingsButton) {
      return {...style.singleButton, backgroundColor: color.orange};
    } else {
      return {...style.singleButton, backgroundColor: color.cyan};
    }
  };

  renderJavalab() {
    const {isDarkMode} = this.props;
    if (isDarkMode) {
      document.body.style.backgroundColor = '#1b1c17';
    } else {
      document.body.style.backgroundColor = color.background_gray;
    }
    return (
      <StudioAppWrapper>
        <div style={style.javalab}>
          <div style={style.instructionsAndPreview}>
            <InstructionsWithWorkspace>
              <div style={style.preview}>
                <PaneHeader hasFocus={true}>
                  <PaneSection>Preview</PaneSection>
                </PaneHeader>
              </div>
            </InstructionsWithWorkspace>
          </div>
          <div
            style={{
              ...style.editorAndConsole,
              color: isDarkMode ? color.white : color.black
            }}
          >
            <JavalabEditor onCommitCode={this.props.onCommitCode} />
            <div style={style.consoleAndButtons}>
              <div style={style.buttons}>
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
                  onClick={this.props.onContinue}
                >
                  <FontAwesome icon="check" className="fa-2x" />
                  <br />
                  Continue
                </button>
              </div>
              <div style={style.buttons}>
                <JavalabSettings
                  style={this.getButtonStyles(true /* isSettingsButton */)}
                >
                  {this.renderSettings()}
                </JavalabSettings>
                <button
                  type="button"
                  style={this.getButtonStyles(false)}
                  onClick={this.run}
                >
                  <FontAwesome icon="play" className="fa-2x" />
                  <br />
                  Run
                </button>
              </div>
              <div style={style.consoleStyle}>
                <JavalabConsole />
              </div>
            </div>
          </div>
        </div>
      </StudioAppWrapper>
    );
  }

  render() {
    return this.state.loading ? (
      <div className="loading" />
    ) : this.state.loadSuccess ? (
      this.renderJavalab()
    ) : (
      // TODO: improve error messaging/styling
      <div>Sorry, we encountered an error</div>
    );
  }
}

export default connect(
  state => ({
    isProjectLevel: state.pageConstants.isProjectLevel,
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace,
    channelId: state.pageConstants.channelId,
    isDarkMode: state.javalab.isDarkMode
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log)),
    toggleDarkMode: () => dispatch(toggleDarkMode())
  })
)(JavalabView);
