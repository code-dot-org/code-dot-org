import React, {PropTypes} from 'react';
import {connect} from 'react-redux';

import {KeyCodes} from '../../../constants';
import {
  add as addWatchExpression,
  remove as removeWatchExpression
} from '../../../redux/watchedExpressions';
import CommandHistory from './CommandHistory';
import JSInterpreter from '../../../JSInterpreter';

import {actions, selectors} from './redux';

const WATCH_COMMAND_PREFIX = "$watch ";
const UNWATCH_COMMAND_PREFIX = "$unwatch ";

/**
 * Set the cursor position to the end of the text content in a div element.
 * @see http://stackoverflow.com/a/6249440/5000129
 * @param {!HTMLDivElement} element
 */
function moveCaretToEndOfDiv(element) {
  var range = document.createRange();
  if (element.childNodes.length === 0) {
    return;
  }

  range.setStart(element.lastChild, element.lastChild.nodeValue.length);
  range.collapse(true);

  // Change window selection to new range to set cursor position
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}


/**
 * The console for our debugger UI
 */
const DebugConsole = connect(
  state => ({
    commandHistory: selectors.getCommandHistory(state),
    jsInterpreter: selectors.getJSInterpreter(state),
    logOutput: selectors.getLogOutput(state),
  }),
  {
    addWatchExpression,
    removeWatchExpression,
    appendLog: actions.appendLog,
  }
)(React.createClass({
  propTypes: {
    // from redux
    commandHistory: PropTypes.instanceOf(CommandHistory),
    jsInterpreter: PropTypes.instanceOf(JSInterpreter),
    logOutput: PropTypes.string.isRequired,
    addWatchExpression: PropTypes.func.isRequired,
    removeWatchExpression: PropTypes.func.isRequired,
    appendLog: PropTypes.func.isRequired,

    // passed from above
    debugButtons: PropTypes.bool,
    debugWatch: PropTypes.bool,
    style: PropTypes.object,
  },

  onInputKeyDown(e) {
    var input = e.target.textContent;
    if (e.keyCode === KeyCodes.ENTER) {
      e.preventDefault();
      this.props.commandHistory.push(input);
      e.target.textContent = '';
      this.appendLog('> ' + input);
      if (0 === input.indexOf(WATCH_COMMAND_PREFIX)) {
        this.props.addWatchExpression(
          input.substring(WATCH_COMMAND_PREFIX.length)
        );
      } else if (0 === input.indexOf(UNWATCH_COMMAND_PREFIX)) {
        this.props.removeWatchExpression(
          input.substring(UNWATCH_COMMAND_PREFIX.length)
        );
      } else if (this.props.jsInterpreter) {
        try {
          var result = this.props.jsInterpreter.evalInCurrentScope(input);
          this.appendLog('< ' + String(result));
        } catch (err) {
          this.appendLog('< ' + String(err));
        }
      } else {
        this.appendLog('< (not running)');
      }
    } else if (e.keyCode === KeyCodes.UP) {
      e.target.textContent = this.props.commandHistory.goBack(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    } else if (e.keyCode === KeyCodes.DOWN) {
      e.target.textContent = this.props.commandHistory.goForward(input);
      moveCaretToEndOfDiv(e.target);
      e.preventDefault(); // Block default Home/End-like behavior in Chrome
    }
  },

  appendLog(output) {
    this.props.appendLog(output);
  },

  componentDidUpdate() {
    this._debugOutput.scrollTop = this._debugOutput.scrollHeight;
  },

  clearOutput() {
    if (this._debugOutput) {
      this._debugOutput.textContent = '';
    }
  },

  clearDebugInput() {
    // TODO: this needs to get called on ATTACH action being dispatched
    // alternatively, the text content should get stored in redux.
    if (this._debugInput) {
      this._debugInput.textContent = '';
    }
  },


  /**
   * On mouseup over the console output, if the user hasn't just selected some
   * text, place the focus in the console input box.
   * @param {MouseEvent} e
   */
  onDebugOutputMouseUp(e) {
    if (e.target.tagName === "DIV" &&
        window.getSelection().toString().length === 0) {
      this._debugInput.focus();
    }
  },

  render() {
    var classes = 'debug-console';
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
        style={this.props.style}
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
          className="debug-output"
          ref={el => this._debugOutput = el}
        >
          {this.props.logOutput}
        </div>
        <span className="debug-input-prompt">
          &gt;
        </span>
        <div
          contentEditable
          spellCheck="false"
          id="debug-input"
          className="debug-input"
          ref={el => this._debugInput = el}
          onKeyDown={this.onInputKeyDown}
        />
      </div>
    );
  },
}));

export default DebugConsole;
