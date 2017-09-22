import Radium from 'radium';
import React, {PropTypes} from 'react';
import color from "../../util/color";

import { addMouseUpTouchEvent } from '../../dom';
import { connect } from 'react-redux';
import { getOuterHeight, scrollBy } from './utils';

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
    borderBottomColor: color.purple,
  },
  arrowDown: {
    borderTopWidth: HEIGHT,
    borderTopColor: color.purple,
  },
};

const MARGIN = 5;
const CRAFT_MARGIN = 0;

/**
 * A pair of buttons for scrolling instructions in CSF
 */
const ScrollButtons = React.createClass({
  propTypes: {
    style: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    getScrollTarget: PropTypes.func.isRequired,
    isMinecraft: PropTypes.bool.isRequired,
  },

  getMargin() {
    return this.props.isMinecraft ? CRAFT_MARGIN : MARGIN;
  },

  getMinHeight() {
    const scrollButtonsHeight = getOuterHeight(this.refs.scrollUp, true) +
        getOuterHeight(this.refs.scrollDown, true);
    return scrollButtonsHeight + (this.getMargin() * 2);
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

    const upStyle = {
      opacity: this.props.visible ? 1 : 0,
      top: this.getMargin()
    };

    const downStyle = {
      opacity: this.props.visible ? 1 : 0,
      bottom: -(this.props.height - this.getMargin())
    };

    // for most tutorials, we have minimalist arrow elements. For
    // minecraft, we use a special button element to stylistically align
    // with the other buttons on the screen.

    const upButton = (this.props.isMinecraft) ?
      <button
        className="arrow"
        ref="scrollUp"
        onMouseDown={this.scrollStart.bind(this, DIRECTIONS.UP)}
        style={[
          styles.all,
          upStyle
        ]}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-up-btn" />
      </button> :
      <div
        ref="scrollUp"
        onMouseDown={this.scrollStart.bind(this, DIRECTIONS.UP)}
        style={[
          styles.all,
          styles.arrow,
          styles.arrowUp,
          upStyle
        ]}
      />;

    const downButton = (this.props.isMinecraft) ?
      <button
        className="arrow"
        ref="scrollDown"
        onMouseDown={this.scrollStart.bind(this, DIRECTIONS.DOWN)}
        style={[
          styles.all,
          downStyle
        ]}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-down-btn" />
      </button> :
      <div
        ref="scrollDown"
        onMouseDown={this.scrollStart.bind(this, DIRECTIONS.DOWN)}
        style={[
          styles.all,
          styles.arrow,
          styles.arrowDown,
          downStyle
        ]}
      />;

    return (
      <div style={this.props.style}>
        {upButton}
        {downButton}
      </div>
    );
  }
});

export default connect(function propsFromStore(state) {
  return {
    isMinecraft: !!state.pageConstants.isMinecraft,
  };
}, undefined, undefined, {
  withRef: true
})(Radium(ScrollButtons));
