import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import javalabMsg from '@cdo/javalab/locale';
import color from '@cdo/apps/util/color';
import {KeyCodes} from '@cdo/apps/constants';
import {
  appendInputLog,
  clearConsoleLogs,
  closePhotoPrompter
} from './javalabRedux';
import CommandHistory from '@cdo/apps/lib/tools/jsdebugger/CommandHistory';
import PaneHeader, {
  PaneSection,
  PaneButton
} from '@cdo/apps/templates/PaneHeader';
import PhotoSelectionView from './components/PhotoSelectionView';

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
    onPhotoPrompterFileSelected: PropTypes.func.isRequired,
    bottomRow: PropTypes.element,
    style: PropTypes.object,

    // populated by redux
    consoleLogs: PropTypes.array,
    appendInputLog: PropTypes.func,
    clearConsoleLogs: PropTypes.func,
    isDarkMode: PropTypes.bool,
    isPhotoPrompterOpen: PropTypes.bool,
    closePhotoPrompter: PropTypes.func,
    photoPrompterPromptText: PropTypes.string
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

  // Transform this.props.consoleLogs into an array of strings, with each string
  // representing a single line that will appear in the console.
  getConsoleLines() {
    const lines = [];
    let currentLine = 0;

    lines[currentLine] = '';

    for (const log of this.props.consoleLogs) {
      if (log.type === 'newline') {
        lines[++currentLine] = '';
      } else {
        const text = log.type === 'input' ? log.text + '\n' : log.text;
        const splitText = text.split(/\r?\n/).entries();
        for (const [i, value] of splitText) {
          if (i > 0) {
            lines[++currentLine] = value;
          } else {
            lines[currentLine] += value;
          }
        }
      }
    }

    return lines;
  }

  // Returns a rendering of the console log.  It includes the input field following the final
  // content, taking up the remaining width of the line.
  renderConsoleLogs(isDarkMode) {
    const lines = this.getConsoleLines();

    return lines.map((line, index) => {
      if (index === lines.length - 1) {
        return (
          <div key={index} style={{display: 'flex'}}>
            {line}
            <input
              id="console-input"
              type="text"
              spellCheck="false"
              style={{
                ...styles.input,
                ...(isDarkMode ? styles.darkModeInput : styles.lightModeInput)
              }}
              onKeyDown={this.onInputKeyDown}
              aria-label="console input"
              ref={ref => (this.inputRef = ref)}
              autoFocus
            />
          </div>
        );
      } else {
        return <div key={index}>{line.length === 0 ? ' ' : line}</div>;
      }
    });
  }

  renderConsoleBody() {
    const {
      isPhotoPrompterOpen,
      photoPrompterPromptText,
      onPhotoPrompterFileSelected,
      closePhotoPrompter,
      isDarkMode
    } = this.props;

    if (isPhotoPrompterOpen) {
      return (
        <PhotoSelectionView
          promptText={photoPrompterPromptText}
          style={styles.photoPrompter}
          onPhotoSelected={file => {
            onPhotoPrompterFileSelected(file);
            closePhotoPrompter();
          }}
        />
      );
    } else {
      return (
        <div onClick={this.onLogsClick} style={styles.logs}>
          {this.renderConsoleLogs(isDarkMode)}
        </div>
      );
    }
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

  onLogsClick = () => {
    this.inputRef.focus();
  };

  render() {
    const {isDarkMode, style, bottomRow, clearConsoleLogs} = this.props;

    return (
      <div style={style}>
        <PaneHeader id="pane-header" style={styles.header} hasFocus>
          <PaneButton
            id="javalab-console-clear"
            headerHasFocus
            isRtl={false}
            onClick={() => {
              clearConsoleLogs();
            }}
            iconClass="fa fa-eraser"
            label={javalabMsg.clearConsole()}
          />
          <PaneSection>{javalabMsg.console()}</PaneSection>
        </PaneHeader>
        <div style={styles.container}>
          <div
            style={{
              ...styles.console,
              ...(isDarkMode ? styles.darkMode : styles.lightMode)
            }}
            ref={el => (this._consoleLogs = el)}
            className="javalab-console"
          >
            {this.renderConsoleBody()}
          </div>
          {bottomRow && [
            {...bottomRow, key: 'bottom-row'},
            <div style={styles.spacer} key="spacer" />
          ]}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    consoleLogs: state.javalab.consoleLogs,
    isDarkMode: state.javalab.isDarkMode,
    isPhotoPrompterOpen: state.javalab.isPhotoPrompterOpen,
    photoPrompterPromptText: state.javalab.photoPrompterPromptText
  }),
  dispatch => ({
    appendInputLog: log => dispatch(appendInputLog(log)),
    clearConsoleLogs: () => dispatch(clearConsoleLogs()),
    closePhotoPrompter: () => dispatch(closePhotoPrompter())
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
  darkModeInput: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: color.white,
    float: 'left'
  },
  lightModeInput: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: color.black
  },
  container: {
    marginTop: 30,
    display: 'flex',
    flexGrow: 1,
    overflowY: 'hidden',
    flexDirection: 'column'
  },
  console: {
    flexGrow: 2,
    overflowY: 'auto',
    padding: 5,
    display: 'flex',
    flexDirection: 'column'
  },
  logs: {
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace'
  },
  logLine: {
    display: 'flex'
  },
  input: {
    marginBottom: 0,
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'monospace',
    flexGrow: 1,
    marginTop: -2,
    fontSize: 13
  },
  spacer: {
    width: 8
  },
  header: {
    position: 'absolute',
    textAlign: 'center',
    lineHeight: '30px',
    width: '100%'
  },
  log: {
    padding: 0,
    margin: 0
  },
  photoPrompter: {
    flexGrow: 1
  }
};
