import React from 'react';
import IdelabConsole from './IdelabConsole';
import {connect} from 'react-redux';
import IdelabEditor from './IdelabEditor';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';
import {appendOutputLog} from './idelabRedux';
import PropTypes from 'prop-types';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

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
    backgroundColor: color.white,
    color: color.black
  },
  preview: {
    margin: 15,
    backgroundColor: color.light_gray,
    height: '200px'
  },
  idelab: {
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
    // this matches the current ace editor theme we are using
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

class Idelab extends React.Component {
  static propTypes = {
    // populated by redux
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
      <div style={style.idelab}>
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
          <IdelabEditor />
          <div style={style.consoleAndButtons}>
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
              <IdelabConsole />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  dispatch => ({
    appendOutputLog: log => dispatch(appendOutputLog(log))
  })
)(Idelab);
