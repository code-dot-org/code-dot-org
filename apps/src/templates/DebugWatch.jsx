import React from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {add, update, remove} from '../redux/watchedExpressions';
import TetherComponent from 'react-tether';

const WATCH_TIMER_PERIOD = 50;
const WATCH_VALUE_NOT_RUNNING = "undefined";

const AutocompleteSelector = React.createClass({
  getInitialState() {
    return {
      selectedOption: this.props.options.length - 1
    };
  },

  render() {
    // If we ever want to highlight range of matches:
    // http://stackoverflow.com/a/2295681

    let index = 0;
    return (
      <div
        id="autocomplete-panel"
        style={{
          width: 162,
          height: 'initial',
          background: 'white',
          color: '#808080',
          border: '1px gray solid',
          padding: 0,
          marginTop: -2,
          marginLeft: -1
        }}
      >
        {this.props.options.map((option) => {
          const isSelected = index === this.props.currentIndex;
          const myIndex = index;
          index++;
          const selectedStyle = {
            backgroundColor: '#cad6fa',
            color: 'black'
            };
          return (
          <div
            key={option}
            className="autocomplete-option"
            onClick={() => this.props.onOptionClicked(option)}
            onMouseOver={() => this.props.onOptionHovered(myIndex)}
            style={Object.assign({}, {
                      cursor: 'pointer',
                      marginLeft: 2
                    }, isSelected ? selectedStyle : {})}
          >
            {option}
          </div>
            );
          })}
      </div>
    );
  },

  propTypes: {
    currentText: React.PropTypes.string,
    currentIndex: React.PropTypes.number,
    options: React.PropTypes.arrayOf(React.PropTypes.string),
    onOptionClicked: React.PropTypes.func,
    onOptionHovered: React.PropTypes.func
  }
});

/**
 * A "watchers" window for our debugger.
 */
const DebugWatch = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool,
    isRunning: React.PropTypes.bool,
    watchedExpressions: React.PropTypes.instanceOf(Immutable.List),
    add: React.PropTypes.func.isRequired,
    update: React.PropTypes.func.isRequired,
    remove: React.PropTypes.func.isRequired,
  },

  getInitialState: function () {
    return {
      text: "",
      history: [],
      editing: false,
      autocompleteOpen: false,
      autocompleteIndex: this.autocompleteOptions.length - 1,
      autocompleteOptions: this.autocompleteOptions,
      historyIndex: -1
    };
  },

  autocompleteOptions: [
    'Game.mouseX',
    'Game.mouseY',
    'Game.width',
    'Game.height',
    'Game.frameRate',
    'Game.frameCount',
  ],

  componentDidMount() {
    this.wasRunning = null;
    this.intervalId_ = setInterval(() => {
      const justStoppedRunning = this.wasRunning && !this.props.isRunning;
      this.wasRunning = this.props.isRunning;

      if (!this.props.isRunning) {
        if (justStoppedRunning) {
          this.props.watchedExpressions.map(we => this.props.update(we.get('expression'), WATCH_VALUE_NOT_RUNNING));
        }
        return;
      }

      this.props.watchedExpressions.map(we => {
        if (window.tempJSInterpreter) {
          const currentValue = window.tempJSInterpreter.evaluateWatchExpression(we.get('expression'));
          this.props.update(we.get('expression'), currentValue);
        }
      });
    }, WATCH_TIMER_PERIOD);
  },

  // http://stackoverflow.com/a/7390612
  nonValueDescriptor(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  },

  /**
   * Gets text to display for given value
   * @param obj
   * @returns {*}
   */
  renderValue(obj) {
    const descriptor = this.nonValueDescriptor(obj);
    const isError = obj instanceof Error;

    if (isError) {
      return (
        <span className="watch-value watch-unavailable">
          {i18n.debugWatchNotAvailable()}
        </span>
      );
    }

    switch (descriptor) {
      case 'null':
      case 'undefined':
        return <span className="watch-value">{descriptor}</span>;
      case 'regexp':
        return <span className="watch-value">[regexp]</span>;
      case 'array':
        return <span className="watch-value">[array]</span>;
      case 'function':
        // [function MyFunctionName]
        return (
          <span className="watch-value">
            {`[${obj.toString().match(/(.*)\(/)[1]}]`}
          </span>
        );
      default:
        return <span className="watch-value">{obj.toString()}</span>;
    }
  },

  scrollToBottom() {
    this.refs.scrollableContainer.scrollTop = this.refs.scrollableContainer.scrollHeight;
  },

  addButtonClick() {
    if (this.state.text === '') {
      this.setState({
        autocompleteOpen: true
      });
    } else {
      this.addFromInput();
    }
  },

  addFromInput(inputText = this.state.text) {
    if (inputText === '') {
      return;
    }
    this.props.add(inputText);
    this.setState({
      history: this.state.history.concat(inputText),
      editing: false,
      text: ''
    }, () => {
      this.scrollToBottom();
      this.filterOptions();
    });
  },

  onKeyDown(e) {
    if (e.key === 'Enter') {
      if (this.state.autocompleteOpen) {
        this.addFromInput(this.state.autocompleteOptions[this.state.autocompleteIndex]);
      } else {
        this.addFromInput();
      }
    }
    if (e.key === 'Escape') {
      this.setState({
        editing: false,
        autocompleteOpen: false
      });
    }
    if (e.key === 'ArrowUp') {
      if (this.state.autocompleteOpen) {
        const nOptions = this.state.autocompleteOptions.length;
        const newIndex = (this.state.autocompleteIndex - 1 + nOptions) % nOptions;
        this.setState({
          autocompleteIndex: newIndex,
        });
      } else {
        const nOptions = this.state.history.length;
        const historyIndex = (this.state.historyIndex - 1 + nOptions) % nOptions;
        this.setState({
          editing: false,
          text: this.state.history[historyIndex],
          historyIndex: historyIndex
        });
        this.setState({
          editing: true
        });
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      if (this.state.autocompleteOpen) {
        const newIndex = (this.state.autocompleteIndex + 1) % this.state.autocompleteOptions.length;
        this.setState({
          autocompleteIndex: newIndex,
        });
      } else {
        this.setState({
          editing: false,
          text: ''
        }, () => {
          this.setState({
            editing: true
          });
        });
      }
      e.preventDefault();
    }
  },

  componentDidUpdate(_, prevState) {
    if (prevState.text !== this.state.text) {
      this.filterOptions();
    }
  },

  filterOptions() {
    const text = this.state.text;
    const filteredOptions = this.autocompleteOptions.filter((option) => option.match(new RegExp(text, 'i')));
    const completeMatch = filteredOptions.length === 1 && filteredOptions[0] === text;
    this.setState({
      autocompleteIndex: this.state.autocompleteIndex > filteredOptions.length ? 0 : this.state.autocompleteIndex,
      autocompleteOptions: filteredOptions,
      autocompleteOpen: text.length && filteredOptions.length && !completeMatch
    });
  },

  onAutocompleteOptionClicked(text) {
    this.addFromInput(text);
  },

  onChange(e) {
    this.setState({
      text: e.target.value
    });
  },

  render() {
    return (
      <div
        id="debugger-watch-container"
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <div id="debug-watch" ref="scrollableContainer" className="debug-watch">
          {
            this.props.watchedExpressions.map(wv => {
              const varName = wv.get('expression');
              const varValue = wv.get('lastValue');
              return (
              <div className="debug-watch-item" key={wv.get('uuid')}>
                <div
                  style={{
                    fontSize: 18,
                    float: 'right',
                    cursor: 'pointer',
                    width: 25,
                    backgroundColor: '#be0712',
                    color: 'white',
                    padding: 6,
                    paddingRight: 0,
                    paddingLeft: 10
                  }}
                  onClick={()=> this.props.remove(wv.get('expression'))}
                >
                  x
                </div>
                <div
                  style={{
                    float: 'left',
                    marginTop: 7,
                    marginLeft: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'scroll',
                    width: 160,
                    height: 21,
                  }}
                >
                  <span className="watch-variable"> {varName} </span>
                  <span className="watch-separator">: </span>
                  {this.renderValue(varValue)}
                </div>
              </div>
                );
              })
            }
          <div style={{clear: 'both'}}>
            <div
              style={{
                fontSize: '18px',
                float: 'right',
                cursor: 'pointer',
                width: 25,
                backgroundColor: '#1e93cd',
                color: 'white',
                padding: 6,
                paddingRight: 0,
                paddingLeft: 10
              }}
              onClick={()=>this.addButtonClick()}
            >
              +
            </div>
            <TetherComponent
              attachment="top center"
              constraints={[{
                to: 'scrollParent',
                attachment: 'together'
              }]}
            >
              <input
                placeholder="Variable / Property"
                ref="debugInput"
                onKeyDown={this.onKeyDown}
                onChange={this.onChange}
                onClick={() => this.setState({autocompleteOpen: true})}
                value={this.state.text}
                style={{
                      width: 159,
                      marginTop: 0,
                      height: 25,
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
              />
              {this.state.autocompleteOpen &&
              <AutocompleteSelector
                options={this.state.autocompleteOptions}
                currentIndex={this.state.autocompleteIndex}
                currentText={this.state.text}
                onOptionClicked={this.onAutocompleteOptionClicked}
                onOptionHovered={(index) => this.setState({autocompleteIndex: index})}
              />}
            </TetherComponent>
          </div>
        </div>
      </div>
    );
  }
});

export default connect(state => {
  return {
    watchedExpressions: state.watchedExpressions,
    isRunning: state.runState.isRunning
  };
}, dispatch => {
  return {
    add(expression) {
      dispatch(add(expression));
    },
    update(expression, value) {
      dispatch(update(expression, value));
    },
    remove(expression) {
      dispatch(remove(expression));
    },
  };
})(DebugWatch);

