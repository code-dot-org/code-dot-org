import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

/**
 * A big blue box with an exclamation mark on the left and text on the right.
 */
export default function AlertExclamation({children}) {
  return (
    <table style={styles.tableStyle}>
      <tbody>
        <tr>
          <td>
            <div style={styles.circleStyle}>
              <div style={styles.exclamationStyle}>!</div>
            </div>
          </td>
          <td style={styles.bodyStyle}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

AlertExclamation.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = {
  tableStyle: {
    backgroundColor: color.cyan,
    color: 'white',
    maxWidth: 600,
    margin: '0 auto',
    marginTop: 20,
    borderRadius: 15,
  },
  circleStyle: {
    width: 100,
    height: 100,
    background: 'gold',
    borderRadius: 50,
    MozBorderRadius: 50,
    WebkitBorderRadius: 50,
    margin: 20,
    position: 'relative',
  },
  exclamationStyle: {
    fontSize: 80,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  bodyStyle: {
    paddingLeft: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20,
  },
};
