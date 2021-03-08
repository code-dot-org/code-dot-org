import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  text: {
    display: 'flex',
    justifyContent: 'center'
  }
};

function ProgressTableTextCell({text}) {
  return <div style={styles.text}>{text}</div>;
}

ProgressTableTextCell.propTypes = {
  text: PropTypes.string.isRequired
};

export default ProgressTableTextCell;
