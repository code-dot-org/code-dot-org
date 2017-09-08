/** @file Non-editable positive integer field in the cryptography widget */
import React, {PropTypes} from 'react';

export default function IntegerField(props) {
  const style = Object.assign({
    backgroundColor: props.color || 'transparent',
    padding: '4px 8px',
    borderRadius: 15,
    fontWeight: 'bold'
  }, props.style);
  const displayValue = Number.isInteger(props.value) ? props.value : '??';
  return <span className={props.className} style={style}>{displayValue}</span>;
}
IntegerField.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  color: PropTypes.string,
  style: PropTypes.object
};
