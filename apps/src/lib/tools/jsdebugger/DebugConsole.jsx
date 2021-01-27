/**
 * A react component that renders a little debugging console that interacts
 * with the javascript interpreter. You can type expressions into an input area
 * and have the evaluated result show up in an output area, along with any
 * console logs.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {KeyCodes} from '../../../constants';
import {
  add as addWatchExpression,
  remove as removeWatchExpression
} from '../../../redux/watchedExpressions';
import CommandHistory from './CommandHistory';
import {actions, selectors} from './redux';
import color from '../../../util/color';
import {Inspector, chromeLight} from 'react-inspector';

const DEBUG_INPUT_HEIGHT = 16;
const DEBUG_CONSOLE_LEFT_PADDING = 3;

const INPUT_OUTPUT_SHARED_STYLE = {
  borderWidth: 0,
  padding: 0,
  outline: 0,
  userSelect: 'text'
};

const style = {
  debugOutput: {
    ...INPUT_OUTPUT_SHARED_STYLE,
    paddingLeft: DEBUG_CONSOLE_LEFT_PADDING,
    overflow: 'auto',
    lineHeight: 'normal',
    cursor: 'text',
    whiteSpace: 'pre-wrap',
    flexGrow: 1
  },
  debugOutputBackgroundError: {
    backgroundColor: color.lightest_red
  },
  debugOutputBackgroundWarning: {
    backgroundColor: color.lightest_yellow
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
    height: DEBUG_INPUT_HEIGHT,
    display: 'block',
    paddingLeft: DEBUG_CONSOLE_LEFT_PADDING,
    width: 15,
    cursor: 'text',
    flexGrow: 0
  },
  debugInput: {
    ...INPUT_OUTPUT_SHARED_STYLE,
    maxHeight: DEBUG_INPUT_HEIGHT,
    height: DEBUG_INPUT_HEIGHT,
    lineHeight: DEBUG_INPUT_HEIGHT + 'px',
    flexGrow: 1,
    marginBottom: 0,
    boxShadow: 'none'
  },
  inspector: {
    display: 'inline-flex'
  }
};

// These colors come from the ace editor defaults
const inspectorTheme = {
  ...chromeLight,
  OBJECT_VALUE_NULL_COLOR: 'rgb(88, 92, 246)',
  OBJECT_VALUE_UNDEFINED_COLOR: 'rgb(88, 92, 246)',
  OBJECT_VALUE_REGEXP_COLOR: '#1A1AA6',
  OBJECT_VALUE_STRING_COLOR: '#1A1AA6',
  OBJECT_VALUE_SYMBOL_COLOR: '#1A1AA6',
  OBJECT_VALUE_NUMBER_COLOR: 'rgb(0, 0, 205)',
  OBJECT_VALUE_BOOLEAN_COLOR: 'rgb(88, 92, 246)',
  OBJECT_VALUE_FUNCTION_PREFIX_COLOR: 'rgb(85, 106, 242)'
};

const WATCH_COMMAND_PREFIX = '$watch ';
const UNWATCH_COMMAND_PREFIX = '$unwatch ';

// The JS console, by default, prints 'undefined' when there is no return value.
// We don't want that functionality and therefore don't include 'undefined' in this list.
const FALSY_VALUES = new Set([false, null, 0, '', NaN]);
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
    isAttached: selectors.isAttached(state)
  }),
  {
    addWatchExpression,
    removeWatchExpression,
    evalInCurrentScope: actions.evalInCurrentScope,
    appendLog: actions.appendLog
  },
  null,
  {forwardRef: true}
)(
  class DebugConsole extends React.Component {
    static propTypes = {
      // from redux
      commandHistory: PropTypes.instanceOf(CommandHistory),
      logOutput: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
        PropTypes.string
      ]).isRequired,
      debugConsoleDisabled: PropTypes.bool.isRequired,
      maxLogLevel: PropTypes.string.isRequired,
      isAttached: PropTypes.bool.isRequired,
      addWatchExpression: PropTypes.func.isRequired,
      removeWatchExpression: PropTypes.func.isRequired,
      evalInCurrentScope: PropTypes.func.isRequired,
      appendLog: PropTypes.func.isRequired,
      jsInterpreter: PropTypes.object,

      // passed from above
      debugButtons: PropTypes.bool,
      debugWatch: PropTypes.bool,
      style: PropTypes.object
    };

    onInputKeyDown = e => {
      const input = e.target.value;
      if (e.keyCode === KeyCodes.ENTER) {
        e.preventDefault();
        if (this.props.debugConsoleDisabled) {
          return;
        }
        this.props.commandHistory.push(input);
        e.target.value = '';
        this.appendLog({input: input});
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
            // parentheses prevent the object from being interpreted as a block rather than as an object
            let result = this.props.evalInCurrentScope(
              input[0] === '{' && input[input.length - 1] === '}'
                ? `(${input})`
                : input
            );
            result = this.props.jsInterpreter.interpreter.marshalInterpreterToNative(
              result
            );
            this.appendLog({
              output: result,
              undefinedInput: input === 'undefined' ? true : false
            });
          } catch (err) {
            this.appendLog({output: String(err)});
          }
        } else {
          this.appendLog({output: '(not running)'});
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

    componentDidUpdate(prevProps) {
      const prevOutputSize = prevProps.logOutput.size;
      if (
        typeof prevOutputSize === 'number' &&
        prevOutputSize !== this.props.logOutput.size
      ) {
        this.jumpToBottom();
      }
    }

    jumpToBottom = () => {
      this._debugOutput.scrollTop = this._debugOutput.scrollHeight;
    };

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
    onDebugOutputMouseUp = e => {
      if (
        e.target.tagName === 'DIV' &&
        window.getSelection().toString().length === 0
      ) {
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

    isValidOutput(rowValue) {
      if (rowValue.output) {
        return true;
      } else if (FALSY_VALUES.has(rowValue.output)) {
        return true;
      } else if (
        rowValue.output === undefined &&
        (rowValue.fromConsoleLog || rowValue.undefinedInput)
      ) {
        return true;
      }
      return false;
    }

    displayOutputToConsole() {
      if (this.props.logOutput.size <= 0) {
        return;
      }

      return this.props.logOutput.map((rowValue, i) => {
        if ('function' === typeof rowValue.toJS) {
          rowValue = rowValue.toJS();
        }
        if (rowValue.input) {
          return <div key={i}>&gt; {rowValue.input}</div>;
        } else if (rowValue.skipInspector) {
          return rowValue.output;
        } else if (this.isValidOutput(rowValue)) {
          if (rowValue.fromConsoleLog) {
            return (
              <Inspector
                theme={inspectorTheme}
                key={i}
                data={rowValue.output}
              />
            );
          } else {
            return (
              <div key={i}>
                &lt;{' '}
                <div style={style.inspector}>
                  <Inspector theme={inspectorTheme} data={rowValue.output} />
                </div>
              </div>
            );
          }
        }
      });
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
            root => (this.root = root)
          }
        >
          <div
            id="debug-output"
            onMouseUp={this.onDebugOutputMouseUp}
            ref={el => (this._debugOutput = el)}
            style={{
              ...style.debugOutput,
              ...this.getDebugOutputBackgroundStyle()
            }}
          >
            {this.displayOutputToConsole()}
          </div>
          <div
            style={
              this.props.debugConsoleDisabled
                ? style.debugInputWrapperDisabled
                : style.debugInputWrapper
            }
          >
            <span style={style.debugInputPrompt} onClick={this.focus}>
              &gt;
            </span>
            <input
              type="text"
              spellCheck="false"
              id="debug-input"
              disabled={this.props.debugConsoleDisabled}
              style={style.debugInput}
              ref={el => (this._debugInput = el)}
              onKeyDown={this.onInputKeyDown}
            />
          </div>
        </div>
      );
    }
  }
);
