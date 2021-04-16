import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {appendInputLog} from './javalabRedux';
import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import {KeyCodes} from '@cdo/apps/constants';
import color from '@cdo/apps/util/color';
import PaneHeader, {PaneSection} from '@cdo/apps/templates/PaneHeader';

const style = {
  darkMode: {
    backgroundColor: color.black,
    color: color.white
  },
  lightMode: {
    backgroundColor: color.white,
    color: color.black
  },
  consoleStyle: {
    height: '200px',
    overflowY: 'auto',
    padding: 5
  },
  consoleLogs: {
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    flexGrow: 1
  },
  consoleInputWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    overflow: 'auto'
  },
  consoleInputPrompt: {
    display: 'block',
    width: 15,
    cursor: 'text',
    flexGrow: 0
  },
  consoleInput: {
    flexGrow: 1,
    marginBottom: 0,
    boxShadow: 'none',
    border: 'none'
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

class JavalabConsole extends React.Component {
  static propTypes = {
    onInputMessage: PropTypes.func.isRequired,
    // populated by redux
    consoleLogs: PropTypes.array,
    appendInputLog: PropTypes.func,
    isDarkMode: PropTypes.bool
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

  displayConsoleLogs() {
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
    const {appendInputLog, onInputMessage} = this.props;
    const input = e.target.value;
    if (e.keyCode === KeyCodes.ENTER) {
      e.preventDefault();
      e.target.value = '';
      // Add a newline to maintain consistency with Java command line input.
      this.state.commandHistory.push(input + '\n');
      appendInputLog(input);
      onInputMessage(input);
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
      <div>
        <PaneHeader hasFocus={true}>
          <PaneSection>Console</PaneSection>
        </PaneHeader>
        <div
          style={{
            ...style.consoleStyle,
            ...(this.props.isDarkMode ? style.darkMode : style.lightMode)
          }}
          ref={el => (this._consoleLogs = el)}
          className="javalab-console"
        >
          <div style={style.consoleLogs}>{this.displayConsoleLogs()}</div>
          <div style={style.consoleInputWrapper}>
            <span style={style.consoleInputPrompt} onClick={this.focus}>
              &gt;
            </span>
            <input
              type="text"
              spellCheck="false"
              style={{
                ...style.consoleInput,
                ...(this.props.isDarkMode ? style.darkMode : style.lightMode)
              }}
              onKeyDown={this.onInputKeyDown}
              aria-label="console input"
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    consoleLogs: state.javalab.consoleLogs,
    isDarkMode: state.javalab.isDarkMode
  }),
  dispatch => ({
    appendInputLog: log => dispatch(appendInputLog(log))
  })
)(JavalabConsole);
