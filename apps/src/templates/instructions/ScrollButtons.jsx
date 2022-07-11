import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import color from '../../util/color';
import FontAwesome from '../../templates/FontAwesome';

import {addMouseUpTouchEvent} from '../../dom';
import {getOuterHeight, scrollBy} from './utils';

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
    const showItems = this.props.isMinecraft
      ? this.props.height > 50
      : this.props.height > 20;
    const centerItems = this.props.isMinecraft
      ? this.props.height > 100
      : this.props.height > 60;

    let upStyle = {
      opacity: this.props.visible ? 1 : 0,
      top: 0,
      margin: '0 0 3px 0',
      left: centerItems ? '50%' : 25,
      transform: 'translateX(-50%)'
    };

    const downStyle = {
      opacity: this.props.visible ? 1 : 0,
      bottom: MARGIN,
      right: centerItems ? '50%' : 25,
      transform: 'translateX(50%)'
    };

    const minecraftButton = {
      width: 40
    };

    const containerStyle = {
      height: this.props.height
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
        style={[styles.all, upStyle, minecraftButton]}
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
        style={[styles.all, styles.arrowGlyph, upStyle]}
      >
        <FontAwesome
          icon="caret-up"
          style={{lineHeight: '22px', pointerEvents: 'none'}}
        />
      </div>
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
        style={[styles.all, downStyle, minecraftButton]}
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
        style={[styles.all, styles.arrowGlyph, downStyle]}
      >
        <FontAwesome
          icon="caret-down"
          style={{lineHeight: '22px', pointerEvents: 'none'}}
        />
      </div>
    );

    return (
      showItems && (
        <div style={[containerStyle, this.props.style]}>
          {upButton}
          {downButton}
        </div>
      )
    );
  }
}

const styles = {
  all: {
    position: 'absolute',
    transition: 'opacity 200ms',
    margin: 0
  },
  arrowGlyph: {
    fontSize: 50,
    color: color.purple,
    cursor: 'pointer'
  }
};

export default Radium(ScrollButtons);
