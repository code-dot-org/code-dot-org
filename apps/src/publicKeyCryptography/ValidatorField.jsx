/** @file Non-editable integer field that checks its value against an expected
 *        value and communicates a correct match or a failure. */
import React, {PropTypes} from 'react';
import color from "../util/color";
import IntegerField from './IntegerField';

const UNKNOWN = 0;
const INCORRECT = 1;
const CORRECT = 2;

const STATUS_TEXT = {
  [UNKNOWN]: '',
  [INCORRECT]: 'Try again',
  [CORRECT]: 'You got it!'
};

const FIELD_COLORS = {
  [UNKNOWN]: color.light_gray,
  [INCORRECT]: color.red,
  [CORRECT]: color.green
};

const FIELD_STYLES = {
  [UNKNOWN]: {
    color: color.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.black,
  },
  [INCORRECT]: {
    color: color.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.black,
  },
  [CORRECT]: {
    color: color.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.black,
  }
};

const TEXT_STYLES = {
  [UNKNOWN]: {whiteSpace: 'nowrap'},
  [INCORRECT]: {whiteSpace: 'nowrap', color: color.red},
  [CORRECT]: {whiteSpace: 'nowrap', color: color.realgreen}
};

export default function ValidatorField(props) {
  const status = statusFromProps(props);
  return (
    <span className={props.className}>
      <span style={{whiteSpace: 'nowrap'}}>
        {' = '}
        <IntegerField
          value={props.value}
          color={FIELD_COLORS[status]}
          style={FIELD_STYLES[status]}
        />
      </span>
      {' '}
      <span style={TEXT_STYLES[status]}>{STATUS_TEXT[status]}</span>
    </span>);
}
ValidatorField.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  expectedValue: PropTypes.number,
  shouldEvaluate: PropTypes.bool
};

function statusFromProps({value, expectedValue, shouldEvaluate}) {
  if (shouldEvaluate && [value, expectedValue].every(Number.isInteger)) {
    if (value === expectedValue) {
      return CORRECT;
    }
    return INCORRECT;
  }
  return UNKNOWN;
}
