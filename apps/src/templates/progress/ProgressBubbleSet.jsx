/**
 * An ordered set of progress bubbles.
 */

import React from 'react';
import Radium from 'radium';
import ProgressBubble from './ProgressBubble';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    position: 'relative',
    display: 'inline-block'
  },
  withBackground: {
    display: 'inline-block',
    position: 'relative'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: (ProgressBubble.height - 10) / 2,
    marginBottom: (ProgressBubble.height - 10) / 2,
  },
  backgroundFirst: {
    left: 15
  },
  backgroundLast: {
    right: 15
  },
  bubble: {
    position: 'relative',
  }
};

const ProgressBubbleSet = React.createClass({
  propTypes: {
    startingNumber: React.PropTypes.number.isRequired,
    statuses: React.PropTypes.arrayOf(
      React.PropTypes.string
    ).isRequired,
    urls: React.PropTypes.arrayOf(
      React.PropTypes.string
    ).isRequired
  },

  render() {
    const { startingNumber, statuses, urls } = this.props;

    if (statuses.length !== urls.length) {
      throw new Error('ProgressBubbleSet requires the same number of statuses and urls');
    }

    return (
      <div style={styles.main}>
        {statuses.map((status, index) => (
          <div
            style={styles.withBackground}
            key={index}
          >
            <div
              style={[
                styles.background,
                index === 0 && styles.backgroundFirst,
                index === statuses.length - 1 && styles.backgroundLast
              ]}
            />
            <div style={{position: 'relative'}}>
              <ProgressBubble
                number={startingNumber + index}
                status={status}
                url={urls[index]}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
});

export default Radium(ProgressBubbleSet);
