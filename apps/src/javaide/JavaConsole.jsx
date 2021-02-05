import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {appendInputLog} from './redux';
import CommandHistory from '../lib/tools/jsdebugger/CommandHistory';
import {KeyCodes} from '../constants';

const style = {
  consoleStyle: {
    backgroundColor: 'black',
    color: 'white',
    height: '200px',
    overflowY: 'auto'
  },
  debugOutput: {
    overflow: 'auto',
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    flexGrow: 1
  },
  debugInputWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex'
  },
  debugInputWrapperDisabled: {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    backgroundColor: '#eee'
  },
  debugInputPrompt: {
    display: 'block',
    width: 15,
    cursor: 'text',
    flexGrow: 0
  },
  debugInput: {
    flexGrow: 1,
    marginBottom: 0,
    boxShadow: 'none',
    backgroundColor: 'black',
    color: 'white',
    border: 'none'
  },
  inspector: {
    display: 'inline-flex'
  }
};

/**
 * Set the cursor position to the end of the text content in a div element.
 * @see http://stackoverflow.com/a/6249440/5000129
 * @param {!HTMLDivElement} element
 */
function moveCaretToEndOfDiv(element) {
  const range = document.createRange();
  if (element.childNodes.length === 0) {
    return;
  }

  range.setStart(element.lastChild, element.lastChild.nodeValue.length);
  range.collapse(true);

  // Change window selection to new range to set cursor position
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

class JavaConsole extends React.Component {
  static propTypes = {
    // populated by redux
    consoleLogs: PropTypes.array,
    appendInputLog: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      commandHistory: new CommandHistory()
    };
  }

  componentDidUpdate(prevProps) {
    const prevLogsLength = prevProps.consoleLogs.length;
    if (
      typeof prevLogsLength === 'number' &&
      prevLogsLength !== this.props.consoleLogs.length
    ) {
      this.jumpToBottom();
    }
  }

  jumpToBottom = () => {
    this._consoleLogs.scrollTop = this._consoleLogs.scrollHeight;
  };

  displayConsoleOutput() {
    return this.props.consoleLogs.map((log, i) => {
      let prefix = '<';
      if (log.type === 'input') {
        prefix = '>';
      }
      return (
        <p key={`log_${i}`}>
          {prefix} {log.text}
        </p>
      );
    });
  }

  onInputKeyDown = e => {
    const input = e.target.value;
    if (e.keyCode === KeyCodes.ENTER) {
      e.preventDefault();
      e.target.value = '';
      this.state.commandHistory.push(input);
      this.props.appendInputLog(input);
    } else if (e.keyCode === KeyCodes.UP) {
      e.target.value = this.state.commandHistory.goBack(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    } else if (e.keyCode === KeyCodes.DOWN) {
      e.target.value = this.state.commandHistory.goForward(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    }
  };

  render() {
    return (
      <div style={style.consoleStyle} ref={el => (this._consoleLogs = el)}>
        <div style={style.debugOutput}>{this.displayConsoleOutput()}</div>
        <div style={style.debugInputWrapper}>
          <span style={style.debugInputPrompt} onClick={this.focus}>
            &gt;
          </span>
          <input
            type="text"
            spellCheck="false"
            id="debug-input"
            style={style.debugInput}
            ref={el => (this._debugInput = el)}
            onKeyDown={this.onInputKeyDown}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    consoleLogs: state.javaIde.consoleLogs
  }),
  dispatch => ({
    appendInputLog: log => dispatch(appendInputLog(log))
  })
)(JavaConsole);
