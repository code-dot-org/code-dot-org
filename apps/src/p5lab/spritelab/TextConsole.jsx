/** @file Text display over sprite lab visualization column */
import PropTypes from 'prop-types';
import React from 'react';
import {Transition} from 'react-transition-group';
import color from '@cdo/apps/util/color';

const lineHeight = 20;
const topMargin = 5;
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
    marginTop: topMargin,
    lineHeight: lineHeight,
    transitionProperty: 'max-height',
    transitionDuration: '1000ms'
  },
  expandButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    minWidth: lineHeight,
    margin: 0,
    marginTop: topMargin,
    border: 0,
    padding: 0,
    fontSize: 'inherit',
    lineHeight: 'inherit',
    borderRadius: 0,
    fontFamily: 'monospace'
  },
  text: {
    fontSize: 17,
    paddingLeft: 5,
    background: color.lightest_gray,
    borderRadius: 4,
    marginBottom: 3
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
    maxHeight: lineHeight + topMargin
  },
  exited: {
    overflow: 'hidden',
    maxHeight: lineHeight + topMargin,
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
