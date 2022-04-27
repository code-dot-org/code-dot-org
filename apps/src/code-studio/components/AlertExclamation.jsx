import React from 'react';
import PropTypes from 'prop-types';

/**
 * A big blue box with an exclamation mark on the left and text on the right.
 */
export default function AlertExclamation({children}) {
  const cyan = '#0094ca';
  const style = {
    backgroundColor: cyan,
    color: 'white',
    maxWidth: 600,
    margin: '0 auto',
    marginTop: 20,
    borderRadius: 15
  };

  const circleStyle = {
    width: 100,
    height: 100,
    background: 'gold',
    borderRadius: 50,
    MozBorderRadius: 50,
    WebkitBorderRadius: 50,
    margin: 20,
    position: 'relative'
  };

  const exclamationStyle = {
    fontSize: 80,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  const bodyStyle = {
    paddingLeft: 0,
    paddingTop: 10,
    paddingBottom: 10,
    paddingRight: 20
  };

  return (
    <table style={style}>
      <tbody>
        <tr>
          <td>
            <div style={circleStyle}>
              <div style={exclamationStyle}>!</div>
            </div>
          </td>
          <td style={bodyStyle}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}

AlertExclamation.propTypes = {
  children: PropTypes.node.isRequired
};
