import React from 'react';
import PropTypes from 'prop-types';

function TextButton({text, onClick, style}) {
  const buttonStyle = {...styles.button, ...style};

  return (
    <button onClick={onClick} style={buttonStyle} type="button">
      {text}
    </button>
  );
}

TextButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  styles: PropTypes.object
};

const styles = {
  button: {
    backgroundColor: 'unset',
    border: 'unset',
    padding: 0,
    margin: 0,
    ':hover': {
      boxShadow: 'none'
    }
  }
};

export default TextButton;
