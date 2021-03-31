import React from 'react';
import JavalabConsole from './JavalabConsole';
import {loadFiles} from './JavalabFileManagement';
import {connect} from 'react-redux';
import JavalabEditor from './JavalabEditor';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {appendOutputLog} from './javalabRedux';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import StudioAppWrapper from '@cdo/apps/templates/StudioAppWrapper';
import InstructionsWithWorkspace from '@cdo/apps/templates/instructions/InstructionsWithWorkspace';

const style = {
  instructionsAndPreview: {
    width: '40%',
    position: 'relative',
    marginRight: 15,
    color: color.black
  },
  editorAndConsole: {
    width: '60%',
    position: 'relative',
    color: color.white
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
    appendOutputLog: PropTypes.func
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
      type: 'get'
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

  renderJavalab() {
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
          <div style={style.editorAndConsole}>
            <JavalabEditor onCommitCode={this.props.onCommitCode} />
            <div style={style.consoleAndButtons}>
              <div style={style.buttons}>
                <button
                  type="button"
                  style={style.singleButton}
                  onClick={() => {}}
                >
                  <FontAwesome icon="stop" className="fa-2x" />
                  <br />
                  Stop
                </button>
                <button
                  type="button"
                  style={style.singleButton}
                  onClick={this.props.onContinue}
                >
                  <FontAwesome icon="check" className="fa-2x" />
                  <br />
                  Continue
                </button>
              </div>
              <div style={style.buttons}>
                <button
                  type="button"
                  style={style.singleButton}
                  onClick={this.compile}
                >
                  <FontAwesome icon="cubes" className="fa-2x" />
                  <br />
                  Compile
                </button>
                <button
                  type="button"
                  style={style.singleButton}
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
    isReadOnlyWorkspace: state.pageConstants.isReadOnlyWorkspace
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log))
  })
)(JavalabView);
