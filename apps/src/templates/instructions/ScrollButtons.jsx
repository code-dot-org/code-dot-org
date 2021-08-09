import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../util/color';

import {addMouseUpTouchEvent} from '../../dom';
import {getOuterHeight, scrollBy} from './utils';

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

const MARGIN = 5;
const CRAFT_MARGIN = 0;

/**
 * A pair of buttons for scrolling instructions in CSF
 */
class ScrollButtons extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    getScrollTarget: PropTypes.func.isRequired,
    isMinecraft: PropTypes.bool.isRequired
  };

  getMargin() {
    return this.props.isMinecraft ? CRAFT_MARGIN : MARGIN;
  }

  getMinHeight() {
    const scrollButtonsHeight =
      getOuterHeight(this.scrollUp, true) +
      getOuterHeight(this.scrollDown, true);
    return scrollButtonsHeight + this.getMargin() * 2;
  }

  scrollStartUp = () => {
    this.scrollStart(DIRECTIONS.UP);
  };

  scrollStartDown = () => {
    this.scrollStart(DIRECTIONS.DOWN);
  };

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
    this.scrollTimeout = setTimeout(
      function() {
        this.scrollInterval = setInterval(
          function() {
            let dist = CONTINUOUS_SCROLL_BY;
            if (dir === DIRECTIONS.UP) {
              dist *= -1;
            }
            scrollBy(contentContainer, dist, false);
          }.bind(this),
          CONTINUOUS_SCROLL_INTERVAL
        );
      }.bind(this),
      CONTINUOUS_SCROLL_TIMEOUT
    );

    this.unbindMouseUp = addMouseUpTouchEvent(document, this.scrollStop);
  }

  scrollStop = () => {
    this.unbindMouseUp();
    clearTimeout(this.scrollTimeout);
    clearInterval(this.scrollInterval);
    this.unbindMouseUp = null;
    this.scrollTimeout = null;
    this.scrollInterval = null;
  };

  render() {
    const upStyle = {
      opacity: this.props.visible ? 1 : 0,
      top: this.getMargin(),
      margin: '0 0 3px 0'
    };

    const downStyle = {
      opacity: this.props.visible ? 1 : 0,
      bottom: -(this.props.height - this.getMargin())
    };

    // for most tutorials, we have minimalist arrow elements. For
    // minecraft, we use a special button element to stylistically align
    // with the other buttons on the screen.

    const upButton = this.props.isMinecraft ? (
      <button
        type="button"
        className="arrow"
        ref={c => {
          this.scrollUp = c;
        }}
        key="scrollUp"
        onMouseDown={this.scrollStartUp}
        style={[styles.all, upStyle]}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-up-btn" />
      </button>
    ) : (
      <div
        ref={c => {
          this.scrollUp = c;
        }}
        key="scrollUp"
        onMouseDown={this.scrollStartUp}
        style={[styles.all, styles.arrow, styles.arrowUp, upStyle]}
      />
    );

    const downButton = this.props.isMinecraft ? (
      <button
        type="button"
        className="arrow"
        ref={c => {
          this.scrollDown = c;
        }}
        key="scrollDown"
        onMouseDown={this.scrollStartDown}
        style={[styles.all, downStyle]}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-down-btn" />
      </button>
    ) : (
      <div
        ref={c => {
          this.scrollDown = c;
        }}
        className="uitest-scroll-button-down"
        key="scrollDown"
        onMouseDown={this.scrollStartDown}
        style={[styles.all, styles.arrow, styles.arrowDown, downStyle]}
      />
    );

    return (
      <div style={this.props.style}>
        {upButton}
        {downButton}
      </div>
    );
  }
}

const styles = {
  all: {
    position: 'absolute',
    transition: 'opacity 200ms',
    margin: 0
  },
  arrow: {
    width: 0,
    height: 0,
    cursor: 'pointer',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRightWidth: WIDTH,
    borderLeftWidth: WIDTH,
    ':hover': {
      filter: 'drop-shadow(2px 2px 5px rgba(0,0,0,0.3))'
    }
  },
  arrowUp: {
    borderBottomWidth: HEIGHT,
    borderBottomColor: color.purple
  },
  arrowDown: {
    borderTopWidth: HEIGHT,
    borderTopColor: color.purple
  }
};

export default Radium(ScrollButtons);
