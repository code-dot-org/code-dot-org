import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  text: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '10px'
  }
};

function ProgressTableTextLabelCell({text}) {
  return <div style={styles.text}>{text}</div>;
}

ProgressTableTextLabelCell.propTypes = {
  text: PropTypes.string.isRequired
};

export default ProgressTableTextLabelCell;
