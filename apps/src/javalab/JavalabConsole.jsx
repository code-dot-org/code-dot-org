import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import {KeyCodes} from '@cdo/apps/constants';
import {appendInputLog} from './javalabRedux';
import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import InputPrompt from './InputPrompt';

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
    style: PropTypes.object,

    // populated by redux
    consoleLogs: PropTypes.array,
    appendInputLog: PropTypes.func,
    isDarkMode: PropTypes.bool
  };

  state = {
    commandHistory: new CommandHistory()
  };

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
      return (
        <div key={`log-${i}`} style={styles.lineWrapper}>
          {log.type === 'input' && <InputPrompt />}
          {log.text}
        </div>
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
    const {isDarkMode, style} = this.props;

    return (
      <div style={style}>
        <PaneHeader hasFocus>
          <PaneButton
            id="javalab-console-clear"
            headerHasFocus
            isRtl={false}
            label={javalabMsg.clearConsole()}
          />
          <PaneSection>{javalabMsg.console()}</PaneSection>
        </PaneHeader>
        <div style={styles.container}>
          {}
          <div
            style={{
              ...styles.console,
              ...(isDarkMode ? styles.darkMode : styles.lightMode)
            }}
            ref={el => (this._consoleLogs = el)}
            className="javalab-console"
          >
            <div style={styles.logs}>{this.displayConsoleLogs()}</div>
            <div style={styles.lineWrapper}>
              <InputPrompt onClick={this.focus} />
              <input
                type="text"
                spellCheck="false"
                style={{
                  ...styles.input,
                  ...(isDarkMode ? styles.darkMode : styles.lightMode)
                }}
                onKeyDown={this.onInputKeyDown}
                aria-label="console input"
              />
            </div>
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

const styles = {
  darkMode: {
    backgroundColor: color.black,
    color: color.white
  },
  lightMode: {
    backgroundColor: color.white,
    color: color.black
  },
  container: {
    display: 'flex'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column'
  },
  console: {
    height: 200,
    flexGrow: 2,
    overflowY: 'auto',
    padding: 5
  },
  logs: {
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    flexGrow: 1
  },
  lineWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    overflow: 'auto',
    fontSize: 14
  },
  input: {
    flexGrow: 1,
    marginBottom: 0,
    boxShadow: 'none',
    border: 'none',
    padding: 0
  }
};
