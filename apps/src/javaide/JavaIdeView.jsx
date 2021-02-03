import React from 'react';
import JavaConsole from './JavaConsole';
import {connect} from 'react-redux';
import JavaEditor from './JavaEditor';
import PaneHeader, {PaneSection} from '../templates/PaneHeader';

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
  javalab: {
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
    padding: 'auto'
  }
};

class JavaIdeView extends React.Component {
  run = () => {
    console.log('running!');
  };

  render() {
    return (
      <div style={style.javalab}>
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
              <div style={style.runButton} onClick={this.run}>
                <i className="fa fa-play fa-2x" />
                Run
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect()(JavaIdeView);
