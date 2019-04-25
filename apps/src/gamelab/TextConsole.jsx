/** @file Grid over visualization */
import PropTypes from 'prop-types';
import React from 'react';
import {Transition} from 'react-transition-group';

export const styles = {
  hide: {
    display: 'none'
  },
  console: {
    display: '',
    background: 'rgba(128,128,128,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
    width: '100%',
    transitionProperty: 'max-height',
    transitionDuration: '1s'
  },
  expandButton: {
    position: 'absolute',
    right: '0',
    zIndex: 3,
    minWidth: '16px',
    margin: '0px',
    border: '0px',
    padding: '0px',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    borderRadius: '0px',
    fontFamily: 'monospace'
  },
  paragraphStyle: {
    margin: '0px'
  }
};

export const transitionStyles = {
  entering: {
    overflow: 'auto',
    maxHeight: '108px'
  },
  entered: {
    overflow: 'auto',
    maxHeight: '108px'
  },
  exiting: {
    overflow: 'auto',
    maxHeight: '18px'
  },
  exited: {
    maxHeight: '18px',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  }
};

export default class TextConsole extends React.Component {
  static propTypes = {
    consoleMessages: PropTypes.array.isRequired
  };

  state = {
    open: false
  };

  timeout = 0;

  toggleConsole() {
    this.state.open ? this.closeConsole() : this.openThenClose();
  }

  openThenClose() {
    clearTimeout(this.timeout);
    this.openConsole();
    this.timeout = setTimeout(() => {
      this.closeConsole();
    }, 4000);
  }

  openConsole() {
    this.setState({open: true}, () => {
      this.scrollToBottom();
    });
  }

  closeConsole() {
    this.setState({open: false});
  }

  getButtonStyle() {
    if (this.state.open || !this.props.consoleMessages.length) {
      return styles.hide;
    } else {
      return styles.expandButton;
    }
  }

  getLines(state) {
    if (state === 'exited' && this.props.consoleMessages.length > 0) {
      return this.renderLine(
        this.props.consoleMessages[this.props.consoleMessages.length - 1]
      );
    }

    return this.props.consoleMessages.map((message, index) =>
      this.renderLine(message, index)
    );
  }

  renderLine(message, index = 0) {
    return (
      <p style={styles.paragraphStyle} key={index}>
        {message.name && <b>{message.name}: </b>}
        {message.text}
      </p>
    );
  }

  scrollToBottom() {
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }

  componentDidUpdate(previousProp) {
    if (
      this.props.consoleMessages.length !== previousProp.consoleMessages.length
    ) {
      this.openThenClose();
    }
  }

  render() {
    return (
      <div>
        <Transition in={this.state.open} timeout={1000}>
          {state => (
            <span
              id="text-console"
              className="text-console"
              onClick={() => this.toggleConsole()}
              ref={span => {
                this.messageList = span;
              }}
              style={{
                ...styles.console,
                ...transitionStyles[state]
              }}
            >
              {this.getLines(state)}
            </span>
          )}
        </Transition>
        <button
          type="button"
          id="expand-collapse"
          style={this.getButtonStyle()}
          onClick={() => this.openThenClose()}
        >
          +
        </button>
      </div>
    );
  }
}
