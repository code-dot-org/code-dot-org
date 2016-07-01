import React from 'react';
import Radium from 'radium';
import color from '../../color';
import { getOuterHeight } from './utils';

const styles = {
  arrow: {
    width: 0,
    height: 0,
    borderLeft: '20px solid transparent',
    borderRight: '20px solid transparent',
    position: 'absolute',
    transition: 'opacity 200ms',
  },
  arrowUp: {
    borderBottom: '20px solid ' + color.purple,
  },
  arrowDown: {
    borderTop: '20px solid ' + color.purple,
  },
};

const MARGIN = 5;

/**
 * A pair of buttons for scrolling instructions in CSF
 */
const ScrollButtons = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
    visible: React.PropTypes.bool.isRequired,
    height: React.PropTypes.number.isRequired,
    onScrollUp: React.PropTypes.func.isRequired,
    onScrollDown: React.PropTypes.func.isRequired,
  },

  getMinHeight() {
    const scrollButtonsHeight = getOuterHeight(this.refs.scrollUp, true)
        + getOuterHeight(this.refs.scrollDown, true);
    return scrollButtonsHeight + (MARGIN * 2);
  },

  render() {

    const scrollUpStyle = [
      styles.arrow,
      styles.arrowUp,
      {
        opacity: this.props.visible ? 1 : 0,
        top: MARGIN
      }
    ];

    const scrollDownStyle = [
      styles.arrow,
      styles.arrowDown,
      {
        opacity: this.props.visible ? 1 : 0,
        bottom: -(this.props.height - MARGIN)
      }
    ];

    return (
      <div style={this.props.style}>
        <div
            ref='scrollUp'
            onClick={this.props.onScrollUp}
            style={scrollUpStyle}
        />
        <div
            ref='scrollDown'
            onClick={this.props.onScrollDown}
            style={scrollDownStyle}
        />
      </div>
    );
  }
});

export default Radium(ScrollButtons);
