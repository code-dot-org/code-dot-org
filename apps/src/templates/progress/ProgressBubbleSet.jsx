/**
 * An ordered set of progress bubbles.
 */

import React from 'react';
import ProgressBubble from './ProgressBubble';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    position: 'absolute',
  },
  background: {
    // This causes us to be centered
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    height: 10,
    backgroundColor: color.lighter_gray,
  },
  bubbles: {
    position: 'absolute',
    top: 0,
    left: 0
  }
};

const ProgressBubbleSet = React.createClass({
  propTypes: {
    startingNumber: React.PropTypes.number.isRequired,
    statuses: React.PropTypes.arrayOf(
      React.PropTypes.string
    )
  },

  render() {
    const { startingNumber, statuses } = this.props;

    // TODO - handle case where our set wraps onto a second line
    const width = statuses.length * ProgressBubble.size -
      styles.background.marginLeft - styles.background.marginRight;

    return (
      <div style={styles.main}>
        <div style={{...styles.background, width}}/>
        <div style={styles.bubbles}>
          {statuses.map((status, index) => (
            <ProgressBubble
              key={index}
              number={startingNumber + index}
              status={status}
            />
          ))}
        </div>
      </div>
    );
  }
});

export default ProgressBubbleSet;
