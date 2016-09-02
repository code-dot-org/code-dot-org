/** @file Non-editable positive integer field in the cryptography widget */
import React from 'react';
import color from '../color';

export default function IntegerField(props) {
  const style = Object.assign({
    backgroundColor: props.color || 'transparent',
    padding: '4px 8px',
    borderRadius: 15,
    fontWeight: 'bold'
  }, props.style);
  const displayValue = Number.isInteger(props.value) ? props.value : '??';
  return <span style={style}>{displayValue}</span>;
}
IntegerField.propTypes = {
  value: React.PropTypes.number,
  color: React.PropTypes.string,
  style: React.PropTypes.object
};
