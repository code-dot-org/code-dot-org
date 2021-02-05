import React from 'react';
import JavaConsole from './JavaConsole';
import {connect} from 'react-redux';
import JavaEditor from './JavaEditor';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {appendOutputLog} from './redux';
import PropTypes from 'prop-types';

const style = {
  instructionsAndPreview: {
    width: '40%',
    display: 'block'
  },
  editorAndConsole: {
    width: '60%',
    display: 'block'
  },
  instructions: {
    height: '25%',
    marginLeft: 15,
    marginRight: 15,
    backgroundColor: 'white',
    color: 'black'
  },
  preview: {
    margin: 15,
    backgroundColor: 'gray',
    height: '200px'
  },
  javaIde: {
    display: 'flex',
    backgroundColor: '#1b1c17',
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
    backgroundColor: '#272822',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  singleButton: {
    margin: 15,
    textAlign: 'center'
  }
};

class JavaIdeView extends React.Component {
  static propTypes = {
    // populated by redux
    editorText: PropTypes.string,
    appendOutputLog: PropTypes.func
  };

  run = () => {
    this.props.appendOutputLog('Running program...');
    this.props.appendOutputLog('Hello world!');
  };

  compile = () => {
    this.props.appendOutputLog('Compiling program...');
    this.props.appendOutputLog('Compiled!');
  };

  render() {
    return (
      <div style={style.javaIde}>
        <div style={style.instructionsAndPreview}>
          <div style={style.instructions}>
            <PaneHeader hasFocus={true}>
              <PaneSection>Instructions</PaneSection>
            </PaneHeader>
            <ul>
              <li>Instruction 1</li>
              <li>Another Instruction</li>
            </ul>
          </div>
          <div style={style.preview}>
            <PaneHeader hasFocus={true}>
              <PaneSection>Preview</PaneSection>
            </PaneHeader>
          </div>
        </div>
        <div style={style.editorAndConsole}>
          <JavaEditor style={style.editor} />
          <div style={style.consoleAndButtons}>
            <div style={style.buttons}>
              <div
                style={style.singleButton}
                onClick={this.compile}
                className="hover-pointer"
              >
                <i className="fa fa-cubes fa-2x" />
                <br />
                Compile
              </div>
              <div
                style={style.singleButton}
                onClick={this.run}
                className="hover-pointer"
              >
                <i className="fa fa-play fa-2x" />
                <br />
                Run
              </div>
            </div>
            <div style={style.consoleStyle}>
              <JavaConsole />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    editorText: state.javaIde.editorText
  }),
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log))
  })
)(JavaIdeView);
