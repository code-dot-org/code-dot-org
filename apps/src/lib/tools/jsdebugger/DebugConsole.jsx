/**
 * A react component that renders a little debugging console that interacts
 * with the javascript interpreter. You can type expressions into an input area
 * and have the evaluated result show up in an output area, along with any
 * console logs.
 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

import {KeyCodes} from '../../../constants';
import {
  add as addWatchExpression,
  remove as removeWatchExpression
} from '../../../redux/watchedExpressions';
import CommandHistory from './CommandHistory';
import {actions, selectors} from './redux';
import color from '../../../util/color';

const DEBUG_INPUT_HEIGHT = 16;
const DEBUG_CONSOLE_LEFT_PADDING = 3;

const INPUT_OUTPUT_SHARED_STYLE = {
  borderWidth: 0,
  padding: 0,
  outline: 0,
  userSelect: 'text',
};

const style = {
  debugOutput: {
    ...INPUT_OUTPUT_SHARED_STYLE,
    paddingLeft: DEBUG_CONSOLE_LEFT_PADDING,
    overflow: 'auto',
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    flexGrow: 1,
  },
  debugOutputBackgroundError: {
    backgroundColor: color.lightest_red,
  },
  debugOutputBackgroundWarning: {
    backgroundColor: color.lightest_yellow,
  },
  debugInputWrapper: {
    flexGrow: 0,
    flexShrink: 0,
    display: 'flex',
  },
  debugInputPrompt: {
    height: DEBUG_INPUT_HEIGHT,
    display: 'block',
    paddingLeft: DEBUG_CONSOLE_LEFT_PADDING,
    width: 15,
    cursor: 'text',
    flexGrow: 0,
  },
  debugInput: {
    ...INPUT_OUTPUT_SHARED_STYLE,
    maxHeight: DEBUG_INPUT_HEIGHT,
    height: DEBUG_INPUT_HEIGHT,
    lineHeight: DEBUG_INPUT_HEIGHT,
    flexGrow: 1,
    marginBottom: 0,
    boxShadow: 'none',
  },
};

const WATCH_COMMAND_PREFIX = "$watch ";
const UNWATCH_COMMAND_PREFIX = "$unwatch ";

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

/**
 * The console for our debugger UI
 */
export default connect(
  state => ({
    commandHistory: selectors.getCommandHistory(state),
    jsInterpreter: selectors.getJSInterpreter(state),
    logOutput: selectors.getLogOutput(state),
    maxLogLevel: selectors.getMaxLogLevel(state),
    isAttached: selectors.isAttached(state),
  }),
  {
    addWatchExpression,
    removeWatchExpression,
    evalInCurrentScope: actions.evalInCurrentScope,
    appendLog: actions.appendLog,
  },
  null,
  {withRef: true}
)(class DebugConsole extends React.Component {
  static propTypes = {
    // from redux
    commandHistory: PropTypes.instanceOf(CommandHistory),
    logOutput: PropTypes.string.isRequired,
    maxLogLevel: PropTypes.string.isRequired,
    isAttached: PropTypes.bool.isRequired,
    addWatchExpression: PropTypes.func.isRequired,
    removeWatchExpression: PropTypes.func.isRequired,
    evalInCurrentScope: PropTypes.func.isRequired,
    appendLog: PropTypes.func.isRequired,

    // passed from above
    debugButtons: PropTypes.bool,
    debugWatch: PropTypes.bool,
    style: PropTypes.object,
  };

  onInputKeyDown = (e) => {
    const input = e.target.value;
    if (e.keyCode === KeyCodes.ENTER) {
      e.preventDefault();
      this.props.commandHistory.push(input);
      e.target.value = '';
      this.appendLog('> ' + input);
      if (0 === input.indexOf(WATCH_COMMAND_PREFIX)) {
        this.props.addWatchExpression(
          input.substring(WATCH_COMMAND_PREFIX.length)
        );
      } else if (0 === input.indexOf(UNWATCH_COMMAND_PREFIX)) {
        this.props.removeWatchExpression(
          input.substring(UNWATCH_COMMAND_PREFIX.length)
        );
      } else if (this.props.isAttached) {
        try {
          const result = this.props.evalInCurrentScope(input);
          this.appendLog('< ' + String(result));
        } catch (err) {
          this.appendLog('< ' + String(err));
        }
      } else {
        this.appendLog('< (not running)');
      }
    } else if (e.keyCode === KeyCodes.UP) {
      e.target.value = this.props.commandHistory.goBack(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    } else if (e.keyCode === KeyCodes.DOWN) {
      e.target.value = this.props.commandHistory.goForward(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    }
  };

  appendLog(output) {
    this.props.appendLog(output);
  }

  componentDidUpdate() {
    this._debugOutput.scrollTop = this._debugOutput.scrollHeight;
  }

  clearDebugInput() {
    // TODO: this needs to get called on ATTACH action being dispatched
    // alternatively, the text content should get stored in redux.
    if (this._debugInput) {
      this._debugInput.value = '';
    }
  }


  /**
   * On mouseup over the console output, if the user hasn't just selected some
   * text, place the focus in the console input box.
   * @param {MouseEvent} e
   */
  onDebugOutputMouseUp = (e) => {
    if (e.target.tagName === "DIV" &&
        window.getSelection().toString().length === 0) {
      this.focus();
    }
  };

  focus = () => this._debugInput.focus();

  getDebugOutputBackgroundStyle() {
    switch (this.props.maxLogLevel) {
      case 'error':
        return style.debugOutputBackgroundError;
      case 'warning':
        return style.debugOutputBackgroundWarning;
    }
  }

  render() {
    let classes = 'debug-console';
    if (!this.props.debugButtons) {
      classes += ' no-commands';
    }
    if (!this.props.debugWatch) {
      classes += ' no-watch';
    }

    return (
      <div
        id="debug-console"
        className={classes}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...this.props.style
        }}
        ref={
          // we currently need this ref because JsDebugger does some
          // imperative DOM manipulation to change the style of the element
          // when the watchers pane gets resized. There may be perf implications
          // for changing this to do it the react way, so I will leave a todo
          // here to revisit it.
          // TODO: see if we can get rid of this ref.
          root => this.root = root
        }
      >
        <div
          id="debug-output"
          onMouseUp={this.onDebugOutputMouseUp}
          ref={el => this._debugOutput = el}
          style={{...style.debugOutput,...this.getDebugOutputBackgroundStyle()}}
        >
          {this.props.logOutput}
        </div>
        <div style={style.debugInputWrapper}>
          <span
            style={style.debugInputPrompt}
            onClick={this.focus}
          >
            &gt;
          </span>
          <input
            type="text"
            spellCheck="false"
            id="debug-input"
            style={style.debugInput}
            ref={el => this._debugInput = el}
            onKeyDown={this.onInputKeyDown}
          />
        </div>
      </div>
    );
  }
});
