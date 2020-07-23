/** @file Text display over sprite lab visualization column */
import PropTypes from 'prop-types';
import React from 'react';
import {Transition} from 'react-transition-group';

const lineHeight = 20;
const margin = 3;
const maxHeight = lineHeight * 6;

export const styles = {
  hide: {
    display: 'none'
  },
  console: {
    display: '',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    marginTop: margin,
    transitionProperty: 'max-height',
    transitionDuration: '1000ms'
  },
  expandButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: lineHeight,
    margin: 0,
    marginTop: margin,
    border: 0,
    padding: 0,
    fontSize: 'inherit',
    lineHeight: 'inherit',
    borderRadius: 0,
    fontFamily: 'monospace'
  },
  text: {
    fontSize: 15,
    padding: 4,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 3,
    margin: '0px 3px 3px 3px',
    lineHeight: '1.4em'
  }
};

export const transitionStyles = {
  entering: {
    overflow: 'auto',
    maxHeight: maxHeight
  },
  entered: {
    overflow: 'auto',
    maxHeight: maxHeight
  },
  exiting: {
    overflow: 'auto',
    maxHeight: lineHeight + margin * 2
  },
  exited: {
    overflow: 'hidden',
    maxHeight: lineHeight + margin * 2,
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

    return this.props.consoleMessages.map(this.renderLine);
  }

  renderLine(message, index = 0) {
    return (
      <p style={styles.text} key={index}>
        {message.name && <strong>{message.name}: </strong>}
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
            <div
              onClick={() => this.toggleConsole()}
              ref={div => {
                this.messageList = div;
              }}
              style={{
                ...styles.console,
                ...transitionStyles[state]
              }}
            >
              {this.getLines(state)}
            </div>
          )}
        </Transition>
        <button
          type="button"
          style={this.getButtonStyle()}
          onClick={() => this.openThenClose()}
        >
          +
        </button>
      </div>
    );
  }
}
