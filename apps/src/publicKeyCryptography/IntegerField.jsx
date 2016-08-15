/** @file Non-editable positive integer field in the cryptography widget */
import React from 'react';
import color from '../color';

const style = {
  backgroundColor: color.lightest_cyan,
  borderRadius: 4
};

export default function IntegerField(props) {
  const displayValue = typeof props.value === 'number' && !isNaN(props.value) ? props.value : '??';
  return <span style={style}>{displayValue}</span>;
}
IntegerField.propTypes = {
  value: React.PropTypes.number
};
