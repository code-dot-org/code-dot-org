import React from 'react';
import JavaConsole from './JavaConsole';
import {connect} from 'react-redux';
import JavaEditor from './JavaEditor';

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
    margin: '15 15 15 0'
  },
  preview: {
    margin: 15,
    backgroundColor: 'gray',
    color: 'white',
    height: '200px'
  },
  javalab: {
    display: 'flex'
  }
};

class JavalabView extends React.Component {
  render() {
    return (
      <div style={style.javalab}>
        <div style={style.instructionsAndPreview}>
          <div style={style.instructions}>
            <h2>Instructions</h2>
            <ul>
              <li>Instruction 1</li>
              <li>Another Instruction</li>
            </ul>
          </div>
          <div style={style.preview}>A preview</div>
        </div>
        <div style={style.editorAndConsole}>
          <JavaEditor style={style.editor} />
          <JavaConsole />
        </div>
      </div>
    );
  }
}

export default connect()(JavalabView);
