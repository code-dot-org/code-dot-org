import React from 'react';
import PropTypes from 'prop-types';

export default function PlaygroundText({id, text, x, y, height}) {
  // what to do with overflow text?
  const dynamicStyle = {
    marginLeft: parseInt(x),
    marginTop: parseInt(y),
    zIndex: 100,
    fontSize: parseInt(height),
    fontFamily: 'Courier',
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: 'red'
  };

  return (
    <span style={{...dynamicStyle, ...styles.textStyle}} id={id}>
      {text}
    </span>
  );
}

PlaygroundText.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  x: PropTypes.string.isRequired,
  y: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired
};

const styles = {
  textStyle: {
    position: 'absolute'
  }
};
