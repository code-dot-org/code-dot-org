import PropTypes from 'prop-types';
import React from 'react';

const styles = {
  text: {
    display: 'flex',
    justifyContent: 'center'
  },
  label: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: '100%',
    padding: '10px'
  }
};

export function ProgressTableTextCell({text}) {
  return <div style={styles.text}>{text}</div>;
}

ProgressTableTextCell.propTypes = {
  text: PropTypes.string.isRequired
};

export function ProgressTableTextLabelCell({text}) {
  return <div style={styles.label}>{text}</div>;
}

ProgressTableTextLabelCell.propTypes = {
  text: PropTypes.string.isRequired
};
