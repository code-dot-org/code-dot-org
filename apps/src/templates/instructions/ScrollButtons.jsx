import React from 'react';
import Radium from 'radium';
import color from "../../util/color";
import { getOuterHeight, scrollBy } from './utils';
import { addMouseUpTouchEvent } from '../../dom';

const WIDTH = 20;
const HEIGHT = WIDTH;

// By how many pixels should we scroll when clicked?
const SCROLL_BY = 100;

// How long (in ms) should we wait after click and hold to start
// continuous scrolling?
const CONTINUOUS_SCROLL_TIMEOUT = 500;

// When continuously scrolling, how often (in ms) should we 'tick'?
const CONTINUOUS_SCROLL_INTERVAL = 10;

// When continuously scrolling, by how many pixels should we scroll at
// each 'tick'?
const CONTINUOUS_SCROLL_BY = 2;

const DIRECTIONS = {
  UP: 0,
  DOWN: 1
};

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

  scrollStart(dir) {
    // initial scroll in response to button click
    const contentContainer = this.props.getScrollTarget();
    let initialScroll = SCROLL_BY;
    if (dir === DIRECTIONS.UP) {
      initialScroll *= -1;
    }
    scrollBy(contentContainer, initialScroll);

    // If mouse is held down for half a second, begin gradual continuous
    // scroll
    this.scrollTimeout = setTimeout(function () {
      this.scrollInterval = setInterval(function () {
        let dist = CONTINUOUS_SCROLL_BY;
        if (dir === DIRECTIONS.UP) {
          dist *= -1;
        }
        scrollBy(contentContainer, dist, false);
      }.bind(this), CONTINUOUS_SCROLL_INTERVAL);
    }.bind(this), CONTINUOUS_SCROLL_TIMEOUT);

    this.unbindMouseUp = addMouseUpTouchEvent(document, this.scrollStop);
  },

  scrollStop() {
    this.unbindMouseUp();
    clearTimeout(this.scrollTimeout);
    clearInterval(this.scrollInterval);
    this.unbindMouseUp = null;
    this.scrollTimeout = null;
    this.scrollInterval = null;
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
          onMouseDown={this.scrollStart.bind(this, DIRECTIONS.UP)}
          style={scrollUpStyle}
        />
        <div
          ref="scrollDown"
          onMouseDown={this.scrollStart.bind(this, DIRECTIONS.DOWN)}
          style={scrollDownStyle}
        />
      </div>
    );
  }
});

export default Radium(ScrollButtons);
