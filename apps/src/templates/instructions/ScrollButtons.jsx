import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton as MuiIconButton} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

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
  DOWN: 1,
};

const MARGIN = 5;

/**
 * A pair of buttons for scrolling instructions in CSF
 */
class ScrollButtons extends React.Component {
  static propTypes = {
    style: PropTypes.object,
    visible: PropTypes.bool.isRequired,
    height: PropTypes.number.isRequired,
    getScrollTarget: PropTypes.func.isRequired,
    upIcon: PropTypes.node,
    downIcon: PropTypes.node,
  };

  getMinHeight() {
    const scrollButtonsHeight =
      getOuterHeight(this.scrollUp, true) +
      getOuterHeight(this.scrollDown, true);
    return scrollButtonsHeight + MARGIN * 2;
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
    const showItems = this.props.height > 20;

    return (
      showItems && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            gap: 5,
            padding: '0 5px',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            height: '100%',
          }}
        >
          <MuiIconButton
            type="button"
            variant="outlined"
            size="small"
            color="secondary"
            sx={{
              width: 32,
            }}
            ref={c => {
              this.scrollUp = c;
            }}
            key="scrollUp"
            onClick={this.singleScrollUp}
            onMouseDown={this.continuousScrollStartUp}
            aria-label="Scroll instructions up"
          >
            {this.props.upIcon ?? <FontAwesomeV6Icon iconName="caret-up" />}
          </MuiIconButton>
          <MuiIconButton
            type="button"
            variant="outlined"
            size="small"
            color="secondary"
            sx={{
              width: 32,
            }}
            ref={c => {
              this.scrollDown = c;
            }}
            className="uitest-scroll-button-down"
            key="scrollDown"
            onClick={this.singleScrollDown}
            onMouseDown={this.continuousScrollStartDown}
            aria-label="Scroll instructions down"
          >
            {this.props.downIcon ?? <FontAwesomeV6Icon iconName="caret-down" />}
          </MuiIconButton>
        </div>
      )
    );
  }
}

export default ScrollButtons;
