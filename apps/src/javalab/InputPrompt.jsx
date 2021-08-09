import React from 'react';
import PropTypes from 'prop-types';

export default function InputPrompt({onClick}) {
  return (
    <span style={styles.prompt} onClick={onClick}>
      &gt;
    </span>
  );
}

InputPrompt.propTypes = {
  onClick: PropTypes.func
};

InputPrompt.defaultProps = {
  onClick: () => {}
};

const styles = {
  prompt: {
    display: 'block',
    width: 15,
    cursor: 'text',
    flexGrow: 0
  }
};
