/**
 * An ordered set of progress bubbles.
 */

import React from 'react';
import ProgressBubble from './ProgressBubble';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    position: 'relative',
    display: 'inline-block'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
  },
  bubbles: {
    position: 'relative'
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
    return (
      <div style={styles.main}>
        <div style={styles.background}/>
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
