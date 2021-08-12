import PropTypes from 'prop-types';
import React from 'react';
import Immutable from 'immutable';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';
import {add, update, remove} from '../../redux/watchedExpressions';
import TetherComponent from 'react-tether';
import AutocompleteSelector from './AutocompleteSelector';

const WATCH_VALUE_NOT_RUNNING = 'undefined';
const OPTIONS_GAMELAB = [
  'World.mouseX',
  'World.mouseY',
  'World.frameRate',
  'World.frameCount',
  'camera.x',
  'camera.y',
  'sprite.x',
  'sprite.y',
  'sprite.velocityX',
  'sprite.velocityY',
  'sprite.width',
  'sprite.height'
];

const buttonSize = '28px';
const valueAndInputWidth = 'calc(100% - 41px)';
const inputElementHeight = 23;

/**
 * A "watchers" window for our debugger.
 */
class Watchers extends React.Component {
  static propTypes = {
    debugButtons: PropTypes.bool.isRequired,
    isRunning: PropTypes.bool.isRequired,
    watchedExpressions: PropTypes.instanceOf(Immutable.List).isRequired,
    add: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    style: PropTypes.object,
    appType: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.defaultAutocompleteOptions =
      props.appType === 'gamelab' ? OPTIONS_GAMELAB : [];
    this.state = {
      text: '',
      history: [],
      editing: false,
      autocompleteSelecting: false,
      autocompleteOpen: false,
      autocompleteIndex: 0,
      autocompleteOptions: this.defaultAutocompleteOptions,
      historyIndex: -1
    };
  }

  /**
   * Gets text to display for given value
   * @param obj
   * @returns {*}
   */
  renderValue(obj) {
    if (!this.props.isRunning) {
      return <span style={styles.watchValue}>{WATCH_VALUE_NOT_RUNNING}</span>;
    }

    const descriptor = nonValueDescriptor(obj);
    const isError = obj instanceof Error;

    if (isError) {
      return (
        <span style={styles.watchValue} className="watch-unavailable">
          {i18n.debugWatchNotAvailable()}
        </span>
      );
    }

    switch (descriptor) {
      case 'null':
      case 'undefined':
        return <span style={styles.watchValue}>{descriptor}</span>;
      case 'regexp':
        return <span style={styles.watchValue}>[regexp]</span>;
      case 'array':
        return (
          <span style={styles.watchValueArray}>
            {`[list (${obj.length})]`}
            <br />
            {`[${parseArray(obj)}]`}
          </span>
        );
      case 'function':
        // [function MyFunctionName]
        return (
          <span style={styles.watchValue}>
            {`[${obj.toString().match(/(.*)\(/)[1]}]`}
          </span>
        );
      default:
        return <span style={styles.watchValue}>{obj.toString()}</span>;
    }
  }

  scrollToBottom() {
    this.scrollableContainer.scrollTop = this.scrollableContainer.scrollHeight;
  }

  addButtonClick = () => {
    if (this.state.text === '') {
      this.setState({autocompleteOpen: true});
    } else {
      this.addFromInput();
    }
  };

  addFromInput(inputText = this.state.text) {
    if (inputText === '') {
      return;
    }
    this.props.add(inputText);
    this.setState(
      {
        history: [inputText].concat(this.state.history),
        editing: false,
        historyIndex: -1,
        text: ''
      },
      () => {
        this.scrollToBottom();
        this.filterOptions();
      }
    );
  }

  closeAutocomplete = () => {
    this.setState({
      editing: false,
      autocompleteSelecting: false,
      autocompleteOpen: false
    });
  };

  clearInput = () => {
    this.setState(
      {
        editing: false,
        text: ''
      },
      () => {
        this.filterOptions();
        this.setState({editing: true});
      }
    );
  };

  selectHistoryIndex(historyIndex) {
    this.setState(
      {
        editing: false,
        text: this.state.history[historyIndex],
        historyIndex: historyIndex,
        autocompleteSelecting: false,
        autocompleteOpen: false
      },
      () => {
        this.filterOptions();
        this.setState({editing: true});
      }
    );
  }

  selectAutocompleteIndex(autocompleteIndex) {
    this.setState({
      autocompleteSelecting: true,
      autocompleteIndex: autocompleteIndex
    });
  }

  historyDown() {
    const historyIndex = wrapValue(
      this.state.historyIndex - 1,
      this.state.history.length
    );
    this.selectHistoryIndex(historyIndex);
  }

  historyUp() {
    const atTopmostHistoryItem =
      this.state.historyIndex === this.state.history.length - 1;
    if (atTopmostHistoryItem) {
      return;
    }

    const historyIndex = wrapValue(
      this.state.historyIndex + 1,
      this.state.history.length
    );
    this.selectHistoryIndex(historyIndex);
  }

  autocompleteDown() {
    this.selectAutocompleteIndex(
      wrapValue(
        this.state.autocompleteIndex + 1,
        this.state.autocompleteOptions.length
      )
    );
  }

  autocompleteUp() {
    this.selectAutocompleteIndex(
      wrapValue(
        this.state.autocompleteIndex - 1,
        this.state.autocompleteOptions.length
      )
    );
  }

  onKeyDown = e => {
    if (e.key === 'Enter') {
      if (this.state.autocompleteOpen && this.state.autocompleteSelecting) {
        this.addFromInput(
          this.state.autocompleteOptions[this.state.autocompleteIndex]
        );
      } else {
        this.addFromInput();
      }
    }
    if (e.key === 'Escape') {
      this.closeAutocomplete();
    }

    if (e.key === 'ArrowUp') {
      if (this.state.autocompleteOpen) {
        this.autocompleteUp();
      } else if (this.state.history.length > 0) {
        this.historyUp();
      }
      e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
      if (this.state.autocompleteOpen) {
        this.autocompleteDown();
      } else if (this.navigatingHistory()) {
        const atFirstHistoryItem = this.state.historyIndex === 0;
        if (atFirstHistoryItem) {
          this.setState({historyIndex: -1}, this.clearInput);
        } else {
          this.historyDown();
        }
      }
      e.preventDefault();
    }
  };

  navigatingHistory() {
    return this.state.historyIndex >= 0;
  }

  resetAutocomplete() {
    this.setState({
      autocompleteIndex: 0,
      historyIndex: -1,
      autocompleteSelecting: false
    });
  }

  componentDidUpdate(_, prevState) {
    if (prevState.autocompleteOpen && !this.state.autocompleteOpen) {
      this.resetAutocomplete();
    }
  }

  filterOptions = () => {
    const text = this.state.text;
    const filteredOptions = this.defaultAutocompleteOptions.filter(option =>
      option.match(new RegExp(text, 'i'))
    );
    const completeMatch =
      filteredOptions.length === 1 && filteredOptions[0] === text;
    const navigatingHistory = this.navigatingHistory();
    const historyTextModified =
      navigatingHistory && this.state.history[this.state.historyIndex] !== text;
    this.setState({
      autocompleteIndex:
        this.state.autocompleteIndex > filteredOptions.length
          ? 0
          : this.state.autocompleteIndex,
      autocompleteOptions: filteredOptions,
      autocompleteOpen:
        text.length &&
        filteredOptions.length &&
        !completeMatch &&
        (!navigatingHistory || historyTextModified)
    });
  };

  onAutocompleteOptionClicked = text => {
    this.addFromInput(text);
  };

  onChange = e => {
    this.setState(
      {
        text: e.target.value
      },
      this.filterOptions
    );
  };

  render() {
    return (
      <div id="debugger-watch-container" style={styles.watchContainer}>
        <div
          id="debug-watch"
          ref={scrollableContainer =>
            (this.scrollableContainer = scrollableContainer)
          }
          className="debug-watch"
          style={this.props.style}
        >
          {this.props.watchedExpressions.map(wv => {
            const varName = wv.get('expression');
            const varValue = wv.get('lastValue');
            return (
              <div className="debug-watch-item" key={wv.get('uuid')}>
                <div
                  style={styles.watchRemoveButton}
                  onClick={() => this.props.remove(wv.get('expression'))}
                >
                  ×
                </div>
                <div style={styles.watchItemDescription}>
                  <span className="watch-variable">{varName}</span>
                  <span className="watch-separator">: </span>
                  {this.renderValue(varValue)}
                </div>
              </div>
            );
          })}
          <div style={styles.watchInputSection}>
            <div style={styles.watchAddButton} onClick={this.addButtonClick}>
              +
            </div>
            <TetherComponent
              attachment="bottom left"
              targetAttachment="top left"
              constraints={[
                {
                  to: 'scrollParent',
                  attachment: 'together'
                }
              ]}
              style={styles.autocompleteDropdown}
            >
              <input
                placeholder="Variable / Property"
                ref="debugInput"
                onKeyDown={this.onKeyDown}
                onChange={this.onChange}
                onClick={() => this.setState({autocompleteOpen: true})}
                value={this.state.text}
                style={styles.watchInput}
              />
              {this.state.autocompleteOpen && (
                <AutocompleteSelector
                  options={this.state.autocompleteOptions}
                  currentIndex={
                    this.state.autocompleteSelecting
                      ? this.state.autocompleteIndex
                      : -1
                  }
                  onOptionClicked={this.onAutocompleteOptionClicked}
                  onOptionHovered={index =>
                    this.setState({
                      autocompleteSelecting: true,
                      autocompleteIndex: index
                    })
                  }
                  onClickOutside={this.closeAutocomplete}
                />
              )}
            </TetherComponent>
          </div>
        </div>
      </div>
    );
  }
}

const styles = {
  autocompleteDropdown: {
    zIndex: 2 // Needed so the dropdown appears over the coding space (z-index 1)
  },
  watchContainer: {
    width: '100%',
    height: '100%'
  },
  watchRemoveButton: {
    fontSize: 23,
    float: 'right',
    cursor: 'pointer',
    width: buttonSize,
    lineHeight: buttonSize,
    height: buttonSize,
    textAlign: 'center',
    backgroundColor: '#be0712',
    color: 'white',
    margin: 0,
    padding: 0
  },
  watchAddButton: {
    fontSize: 20,
    width: buttonSize,
    lineHeight: buttonSize,
    height: buttonSize,
    textAlign: 'center',
    float: 'right',
    cursor: 'pointer',
    backgroundColor: '#1e93cd',
    color: 'white',
    margin: 0,
    padding: 0
  },
  watchItemDescription: {
    whiteSpace: 'nowrap',
    minHeight: buttonSize,
    marginLeft: 3,
    overflow: 'hidden',
    width: valueAndInputWidth
  },
  watchValueArray: {
    whiteSpace: 'normal'
  },
  watchValue: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: '28px'
  },
  watchInputSection: {
    clear: 'both'
  },
  watchInput: {
    width: valueAndInputWidth,
    marginTop: 0,
    height: inputElementHeight
  }
};

export const UnconnectedWatchers = Watchers;
export default connect(
  state => ({
    watchedExpressions: state.watchedExpressions,
    isRunning: state.runState.isRunning,
    appType: state.pageConstants.appType
  }),
  {
    add,
    update,
    remove
  },
  null,
  {forwardRef: true}
)(Watchers);

// http://stackoverflow.com/a/7390612
function nonValueDescriptor(obj) {
  return {}.toString
    .call(obj)
    .split(' ')[1]
    .slice(0, -1)
    .toLowerCase();
}

function wrapValue(index, length) {
  return (index + length) % length;
}

function parseArray(array) {
  let parsedArray = '';
  array.forEach((element, index, array) => {
    if (element === null) {
      parsedArray += 'null';
    } else if (Array.isArray(element)) {
      parsedArray += 'list (' + element.length + ')';
    } else if (typeof element === 'string') {
      parsedArray += '"' + element + '"';
    } else if (typeof element === 'object') {
      parsedArray += 'object {}';
    } else {
      parsedArray += element;
    }

    if (index !== array.length - 1) {
      parsedArray += ', ';
    }
  });

  return parsedArray;
}
