import React from 'react';
import Radium from 'radium';

/**
 * A component that lays out children in three columns (left, center, right),
 * where left/right widths are specified and center is the remainder. This is
 * done largely to separate some of the semi-complicated styling.
 */

const ThreeColumns = (props) => {
  const { style, leftColWidth, rightColWidth, height, children } = props;

  const styles = {
    container: {
      paddingLeft: leftColWidth,
      paddingRight: rightColWidth,
      float: 'left',
      width: '100%',
      boxSizing: 'border-box'
    },
    middle: {
      width: '100%',
      position: 'relative',
      float: 'left',
      overflowY: 'auto',
      height
    },
    left: {
      position: 'relative',
      float: 'left',
      width: leftColWidth,
      right: leftColWidth,
      marginLeft: '-100%',
    },
    right: {
      position: 'relative',
      float: 'left',
      width: rightColWidth,
      marginRight: -rightColWidth
    }
  };

  return (
    <div style={[styles.container].concat(style)}>
      <div style={styles.middle}>{children[1]}</div>
      <div style={styles.left}>{children[0]}</div>
      <div style={styles.right}>{children[2]}</div>
    </div>
  );
};

ThreeColumns.propTypes = {
  customProp: (props) => {
    if (props.children.length !== 3) {
      throw new Error('ThreeColumns expects exactly 3 children, got ' +
        props.children.length);
    }
  }
};

export default Radium(ThreeColumns);
