import React from 'react';
import Radium from 'radium';
import color from '../../color';
import { getOuterHeight, scrollBy } from './utils';

const WIDTH = 20;
const HEIGHT = WIDTH;

const SCROLL_BY_PERCENT = 0.8;

const styles = {
  arrow: {
    width: 0,
    height: 0,
    cursor: 'pointer',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRightWidth: WIDTH,
    borderLeftWidth: WIDTH,
    position: 'absolute',
    transition: 'opacity 200ms',
    ':hover': {
      filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.3))'
    }
  },
  arrowUp: {
    borderBottomWidth: HEIGHT,
    borderBottomColor: color.purple,
  },
  arrowDown: {
    borderTopWidth: HEIGHT,
    borderTopColor: color.purple,
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
    getScrollTarget: React.PropTypes.func.isRequired,
  },

  getMinHeight() {
    const scrollButtonsHeight = getOuterHeight(this.refs.scrollUp, true) +
        getOuterHeight(this.refs.scrollDown, true);
    return scrollButtonsHeight + (MARGIN * 2);
  },

  scrollStart(scrollingUp) {
    // initial scroll in response to button click
    const contentContainer = this.props.getScrollTarget();
    const contentHeight = contentContainer.clientHeight;
    let initialScroll = contentHeight * SCROLL_BY_PERCENT;
    if (scrollingUp) {
      initialScroll *= -1;
    }
    scrollBy(contentContainer, initialScroll);

    // If mouse is held down for half a second, begin gradual continuous
    // scroll
    var timeout = setTimeout(function () {
      var interval = setInterval(function () {
        scrollBy(contentContainer, scrollingUp ? -2 : 2, false);
      }.bind(this), 10);
      this.setState({
        scrollInterval: interval
      });
    }.bind(this), 500);

    this.setState({
      scrollTimeout: timeout
    });
  },

  scrollStop() {
    clearTimeout(this.state.scrollTimeout);
    clearInterval(this.state.scrollInterval);
    this.setState({
      scrollTimeout: null,
      scrollInterval: null
    });
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
          ref="scrollUp"
          onMouseDown={this.scrollStart.bind(this, true)}
          onMouseUp={this.scrollStop}
          style={scrollUpStyle}
        />
        <div
          ref="scrollDown"
          onMouseDown={this.scrollStart.bind(this, false)}
          onMouseUp={this.scrollStop}
          style={scrollDownStyle}
        />
      </div>
    );
  }
});

export default Radium(ScrollButtons);
