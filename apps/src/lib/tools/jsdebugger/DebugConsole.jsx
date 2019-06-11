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
import Inspector from 'react-inspector';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
// import d3 from 'd3';
import {scaleSqrt} from 'd3-scale';

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
    display: 'inline-block'
  }
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
  {withRef: true}
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
      style: PropTypes.object,
      showReactInspector: PropTypes.bool
    };

    onInputKeyDown = e => {
      const input = e.target.value;
      if (e.keyCode === KeyCodes.ENTER) {
        e.preventDefault();
        this.props.commandHistory.push(input);
        e.target.value = '';
        this.props.showReactInspector
          ? this.appendLog({input: input})
          : this.appendLog('> ' + input);
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
            if (this.props.showReactInspector) {
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
            } else {
              const result = this.props.evalInCurrentScope(input);
              this.appendLog('< ' + String(result));
            }
          } catch (err) {
            this.props.showReactInspector
              ? this.appendLog({output: String(err)})
              : this.appendLog('< ' + String(err));
          }
        } else {
          this.props.showReactInspector
            ? this.appendLog({output: '(not running)'})
            : this.appendLog('< (not running)');
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
    projection() {
      return geoMercator()
        .scale(100)
        .translate([800 / 2, 450 / 2]);
    }

    mercator() {
      let quakeradius = function() {
        const scale = scaleSqrt()
          .domain([0, 100])
          .range([0, 6]);
        return function(quake) {
          return scale(Math.exp(quake.properties.mag));
        };
      };
      console.log('quakeradius', quakeradius());
      let fetchData = async () => {
        return fetch(
          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
        );
      };

      let quakes = async function() {
        var hello = await fetchData();
        var json = await hello.json();
        return json;
      };
      let exampleQuake = quakes();
      console.log('exampleQuake', exampleQuake.features);
      let world = async function() {
        var world = await fetch(
          'https://unpkg.com/world-atlas@1/world/110m.json'
        );

        var json = await world.json();

        return feature(json, json.objects.countries);
      };

      let world2 = world();
      console.log('world2', world2);

      return (
        <svg width={800} height={450}>
          <g className="countries">
            {exampleQuake.features.map((d, i) => (
              <path
                key={`path-${i}`}
                d={geoPath().projection(this.projection())(d)}
                className="country"
                fill={'red'}
                stroke="#FFFFFF"
                strokeWidth={0.5}
              />
            ))}
          </g>
        </svg>
      );
      // var c = DOM.context2d(1000, 700);
      // var canvas = c.canvas;
      //

      // var path = geoPath(projection, c);
      //
      // c.lineWidth = 0.1;
      // c.fillStyle = 'skyblue';
      // c.beginPath();
      // // c.arc(s/2, s/2, radius, 0, 2*Math.PI);
      // c.fill();
      // c.stroke();
      //
      // c.lineWidth = 0.35;
      // c.fillStyle = 'green';
      // c.beginPath();
      // path(world2);
      // c.fill();
      // c.stroke();
      //
      // c.fillStyle = 'red';
      // path.pointRadius(quakeradius());
      // exampleQuake.features.forEach(quake => {
      //   c.beginPath(), path(quake), c.fill();
      // });

      // return canvas;
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
      if (this.props.logOutput.size > 0) {
        return this.props.logOutput.map((rowValue, i) => {
          if ('function' === typeof rowValue.toJS) {
            rowValue = rowValue.toJS();
          }
          if (rowValue.input) {
            return <div key={i}>&gt; {rowValue.input}</div>;
          } else if (this.isValidOutput(rowValue)) {
            if (rowValue.fromConsoleLog) {
              return <Inspector key={i} data={rowValue.output} />;
            } else {
              return (
                <div key={i}>
                  &lt;{' '}
                  <div style={style.inspector}>
                    <Inspector data={rowValue.output} />
                  </div>
                </div>
              );
            }
          }
        });
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
      this.mercator();
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
            <div>{this.mercator()}</div>
            {this.props.showReactInspector
              ? this.displayOutputToConsole()
              : this.props.logOutput}
          </div>
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
);
