import React from 'react';
import JavaConsole from './JavaConsole';
import {connect} from 'react-redux';
import JavaEditor from './JavaEditor';
import PaneHeader, {PaneSection} from '../templates/PaneHeader';
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
    backgroundColor: '#272822',
    margin: 15
  },
  consoleAndButtons: {
    display: 'flex'
  },
  consoleStyle: {
    width: '75%'
  },
  buttons: {
    width: '25%'
  },
  runButton: {
    padding: 10,
    textAlign: 'center',
    display: 'inline-block'
  }
};

class JavaIdeView extends React.Component {
  static propTypes = {
    // populated by redux
    editorText: PropTypes.string,
    appendOutputLog: PropTypes.func
  };

  run = () => {
    this.props.appendOutputLog('Compiling program...');
    this.props.appendOutputLog('Compiled!');
    this.props.appendOutputLog('Running program...');
    this.props.appendOutputLog('Hello world!');
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
          <div style={style.preview}>A preview</div>
        </div>
        <div style={style.editorAndConsole}>
          <PaneHeader hasFocus={true} />
          <JavaEditor style={style.editor} />
          <div style={style.consoleAndButtons}>
            <div style={style.consoleStyle}>
              <JavaConsole />
            </div>
            <div style={style.buttons}>
              <div
                style={style.runButton}
                onClick={this.run}
                className="hover-pointer"
              >
                <i className="fa fa-play fa-2x" />
                <br />
                Run
              </div>
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
