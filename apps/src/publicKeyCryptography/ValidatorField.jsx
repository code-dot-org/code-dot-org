/** @file Non-editable positive integer field in the cryptography widget */
import React from 'react';
import color from '../color';
import IntegerField from './IntegerField';

const style = {
  backgroundColor: color.lightest_cyan,
  borderRadius: 4
};

const UNKNOWN = 0;
const INCORRECT = 1;
const CORRECT = 2;

const STATUS_TEXT = {
  [UNKNOWN]: '',
  [INCORRECT]: 'Try again',
  [CORRECT]: 'You got it!'
};

const FIELD_STYLES = {
  [UNKNOWN]: {backgroundColor: color.light_gray},
  [INCORRECT]: {backgroundColor: color.red},
  [CORRECT]: {backgroundColor: color.green}
};

const TEXT_STYLES = {
  [UNKNOWN]: {},
  [INCORRECT]: {color: color.red},
  [CORRECT]: {color: color.realgreen}
};

export default function ValidatorField(props) {
  const status = statusFromProps(props);
  return (
    <span>
      <IntegerField value={props.value} style={FIELD_STYLES[status]}/>
      <span style={TEXT_STYLES[status]}>{STATUS_TEXT[status]}</span>
    </span>);
}
ValidatorField.propTypes = {
  value: React.PropTypes.number,
  expectedValue: React.PropTypes.number
};

function statusFromProps({value, expectedValue}) {
  if (isPopulated(value) && isPopulated(expectedValue)) {
    if (value === expectedValue) {
      return CORRECT;
    }
    return INCORRECT;
  }
  return UNKNOWN;
}

function isPopulated(val) {
  return typeof val === 'number' && !isNaN(val);
}
