import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {addMouseUpTouchEvent} from '../../dom';
import FontAwesome from '../../legacySharedComponents/FontAwesome';

import {getOuterHeight, scrollBy} from './utils';

import moduleStyles from './scroll-buttons.module.scss';

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
  DOWN: 1,
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
    isMinecraft: PropTypes.bool.isRequired,
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

  continuousScrollStartUp = () => {
    this.continuousScrollStart(DIRECTIONS.UP);
  };

  continuousScrollStartDown = () => {
    this.continuousScrollStart(DIRECTIONS.DOWN);
  };

  singleScrollUp = () => {
    this.singleScroll(DIRECTIONS.UP);
  };

  singleScrollDown = () => {
    this.singleScroll(DIRECTIONS.DOWN);
  };

  singleScroll(dir) {
    // initial scroll in response to button click
    const contentContainer = this.props.getScrollTarget();
    let initialScroll = SCROLL_BY;
    if (dir === DIRECTIONS.UP) {
      initialScroll *= -1;
    }
    scrollBy(contentContainer, initialScroll);
  }

  continuousScrollStart(dir) {
    // If mouse is held down for half a second, begin gradual continuous
    // scroll
    const contentContainer = this.props.getScrollTarget();
    this.scrollTimeout = setTimeout(
      function () {
        this.scrollInterval = setInterval(
          function () {
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

    // for most tutorials, we have minimalist arrow elements. For
    // minecraft, we use a special button element to stylistically align
    // with the other buttons on the screen.

    const upButton = this.props.isMinecraft ? (
      <button
        type="button"
        className={classNames(
          moduleStyles.up,
          this.props.visible && moduleStyles.visible,
          centerItems && moduleStyles.upCenter,
          moduleStyles.minecraftButton,
          'arrow'
        )}
        ref={c => {
          this.scrollUp = c;
        }}
        key="scrollUp"
        onClick={this.singleScrollUp}
        onMouseDown={this.continuousScrollStartUp}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-up-btn" alt="" />
      </button>
    ) : (
      <button
        type="button"
        ref={c => {
          this.scrollUp = c;
        }}
        key="scrollUp"
        onClick={this.singleScrollUp}
        onMouseDown={this.continuousScrollStartUp}
        className={classNames(
          moduleStyles.up,
          this.props.visible && moduleStyles.visible,
          centerItems && moduleStyles.upCenter,
          moduleStyles.arrowGlyph,
          moduleStyles.removeButtonStyles
        )}
      >
        <FontAwesome
          icon="caret-up"
          style={{lineHeight: '22px', pointerEvents: 'none'}}
        />
      </button>
    );

    const downButton = this.props.isMinecraft ? (
      <button
        type="button"
        className={classNames(
          moduleStyles.down,
          this.props.visible && moduleStyles.visible,
          centerItems && moduleStyles.downCenter,
          moduleStyles.minecraftButton,
          'arrow'
        )}
        ref={c => {
          this.scrollDown = c;
        }}
        key="scrollDown"
        onClick={this.singleScrollDown}
        onMouseDown={this.continuousScrollStartDown}
      >
        <img src="/blockly/media/1x1.gif" className="scroll-down-btn" alt="" />
      </button>
    ) : (
      <button
        type="button"
        ref={c => {
          this.scrollDown = c;
        }}
        className={classNames(
          moduleStyles.down,
          this.props.visible && moduleStyles.visible,
          centerItems && moduleStyles.downCenter,
          moduleStyles.arrowGlyph,
          moduleStyles.removeButtonStyles,
          'uitest-scroll-button-down'
        )}
        key="scrollDown"
        onClick={this.singleScrollDown}
        onMouseDown={this.continuousScrollStartDown}
      >
        <FontAwesome
          icon="caret-down"
          style={{lineHeight: '22px', pointerEvents: 'none'}}
        />
      </button>
    );

    return (
      showItems && (
        <div
          className={moduleStyles.container}
          style={{height: this.props.height, ...this.props.style}}
        >
          {upButton}
          {downButton}
        </div>
      )
    );
  }
}

export default ScrollButtons;
