import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import CommandHistory from '@cdo/apps/code-studio/tools/jsdebugger/CommandHistory';
import {KeyCodes} from '@cdo/apps/constants';
import PaneHeader, {
  PaneSection,
  PaneButton,
} from '@cdo/apps/templates/PaneHeader';
import SafeMarkdown from '@cdo/apps/templates/SafeMarkdown';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

import PhotoSelectionView from './components/PhotoSelectionView';
import {DisplayTheme} from './DisplayTheme';
import {
  appendInputLog,
  clearConsoleLogs,
  closePhotoPrompter,
} from './redux/consoleRedux';

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
    displayTheme: PropTypes.oneOf(Object.values(DisplayTheme)),
    isPhotoPrompterOpen: PropTypes.bool,
    closePhotoPrompter: PropTypes.func,
    photoPrompterPromptText: PropTypes.string,
    shouldJumpToInput: PropTypes.bool,
    editorFontSize: PropTypes.number.isRequired,
  };

  state = {
    commandHistory: new CommandHistory(),
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
    this.focusInput();
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
      } else if (log.type === 'markdown') {
        lines[++currentLine] = (
          <SafeMarkdown markdown={log.text} openExternalLinksInNewTab={true} />
        );
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
  renderConsoleLogs(displayTheme) {
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
                ...(displayTheme === DisplayTheme.DARK
                  ? styles.darkModeInput
                  : styles.lightModeInput),
                // TODO: When converting this component's styles to SCSS,
                // font size may need to remain an inline style as it is
                // programmatically assigned, or editor font size logic
                // should be moved into SCSS.
                fontSize: this.props.editorFontSize,
              }}
              onKeyDown={this.onInputKeyDown}
              aria-label="console input"
              ref={ref => (this.inputRef = ref)}
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
      displayTheme,
    } = this.props;

    if (isPhotoPrompterOpen) {
      return (
        <PhotoSelectionView
          promptText={photoPrompterPromptText}
          style={{
            ...styles.photoPrompter,
            ...(displayTheme === DisplayTheme.DARK
              ? styles.darkMode
              : styles.lightMode),
          }}
          onPhotoSelected={file => {
            onPhotoPrompterFileSelected(file);
            closePhotoPrompter();
          }}
        />
      );
    } else {
      return (
        <div onClick={this.focusInput} style={styles.logs}>
          {this.renderConsoleLogs(displayTheme)}
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

  focusInput = () => {
    // only jump to input if the program is currently in run or test mode.
    if (this.props.shouldJumpToInput) {
      this.inputRef.focus();
    }
  };

  render() {
    const {displayTheme, style, bottomRow, clearConsoleLogs, editorFontSize} =
      this.props;

    return (
      <div style={style}>
        <PaneHeader
          id="pane-header"
          style={styles.header}
          hasFocus
          isOldPurpleColor
        >
          <PaneSection
            className={'pane-header-section pane-header-section-left'}
          />
          <PaneSection
            className={'pane-header-section pane-header-section-center'}
          >
            {javalabMsg.console()}
          </PaneSection>
          <PaneSection
            className={'pane-header-section pane-header-section-right'}
          >
            <PaneButton
              id="javalab-console-clear"
              headerHasFocus
              isLegacyStyles
              isRtl={false}
              onClick={() => {
                clearConsoleLogs();
              }}
              iconClass="fa fa-eraser"
              label={javalabMsg.clearConsole()}
            />
          </PaneSection>
        </PaneHeader>
        <div style={styles.container}>
          <div
            style={{
              ...styles.console,
              ...(displayTheme === DisplayTheme.DARK
                ? styles.darkMode
                : styles.lightMode),
              // TODO: When converting this component's styles to SCSS,
              // font size may need to remain an inline style as it is
              // programmatically assigned, or editor font size logic
              // should be moved into SCSS.
              fontSize: editorFontSize,
            }}
            ref={el => (this._consoleLogs = el)}
            className="javalab-console"
          >
            {this.renderConsoleBody()}
          </div>
          {bottomRow && [
            {...bottomRow, key: 'bottom-row'},
            <div style={styles.spacer} key="spacer" />,
          ]}
        </div>
      </div>
    );
  }
}

export default connect(
  state => ({
    consoleLogs: state.javalabConsole.consoleLogs,
    displayTheme: state.javalabView.displayTheme,
    isPhotoPrompterOpen: state.javalabConsole.isPhotoPrompterOpen,
    photoPrompterPromptText: state.javalabConsole.photoPrompterPromptText,
    shouldJumpToInput: state.javalab.isRunning || state.javalab.isTesting,
    editorFontSize: state.javalabView.editorFontSize,
  }),
  dispatch => ({
    appendInputLog: log => dispatch(appendInputLog(log)),
    clearConsoleLogs: () => dispatch(clearConsoleLogs()),
    closePhotoPrompter: () => dispatch(closePhotoPrompter()),
  })
)(JavalabConsole);

const styles = {
  darkMode: {
    backgroundColor: color.black,
    color: color.white,
  },
  lightMode: {
    backgroundColor: color.white,
    color: color.black,
  },
  darkModeInput: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: color.white,
    float: 'left',
  },
  lightModeInput: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: color.black,
  },
  container: {
    marginTop: 30,
    display: 'flex',
    flexGrow: 1,
    overflowY: 'hidden',
    flexDirection: 'column',
  },
  console: {
    flexGrow: 2,
    overflowY: 'auto',
    padding: 5,
    display: 'flex',
    flexDirection: 'column',
  },
  logs: {
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    fontFamily: 'monospace',
  },
  logLine: {
    display: 'flex',
  },
  input: {
    marginBottom: 0,
    boxShadow: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'monospace',
    flexGrow: 1,
    marginTop: -2,
    fontSize: 13,
    height: '100%',
  },
  spacer: {
    width: 8,
  },
  header: {
    position: 'absolute',
    textAlign: 'center',
    lineHeight: '30px',
    width: '100%',
    display: 'flex',
  },
  log: {
    padding: 0,
    margin: 0,
  },
  photoPrompter: {
    flexGrow: 1,
  },
};
