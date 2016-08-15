/** @file Dropdown of prime numbers for use in crypto widget */
import React from 'react';
import IntegerDropdown from './IntegerDropdown';
import {primesInRange} from './cryptographyMath';

export default function PublicModulusDropdown(props) {
  return <IntegerDropdown options={primesInRange(3, 10000)} {...props}/>;
}
PublicModulusDropdown.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
