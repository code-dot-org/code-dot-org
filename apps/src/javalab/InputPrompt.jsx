import React from 'react';
import PropTypes from 'prop-types';

export default function InputPrompt({onClick}) {
  return <span onClick={onClick}>&gt;&nbsp;</span>;
}

InputPrompt.propTypes = {
  onClick: PropTypes.func
};

InputPrompt.defaultProps = {
  onClick: () => {}
};
