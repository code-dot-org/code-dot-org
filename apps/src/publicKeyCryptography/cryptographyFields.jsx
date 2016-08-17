/** @file Input fields specific to the cryptography widget */
import _ from 'lodash';
import React from 'react';
import IntegerDropdown from './IntegerDropdown';
import {primesInRange, privateKeyList} from './cryptographyMath';

/**
 * Dropdown of possible private keys given a particular public modulus.
 * Used by Alice and Eve.
 */
export function PrivateKeyDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={privateKeyList(publicModulus)} {...rest}/>;
}
PrivateKeyDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

/**
 * Dropdown of possible public modulus values, which should be all prime
 * numbers in the range [3..10000).  Used by all three characters.
 */
export function PublicModulusDropdown(props) {
  return <IntegerDropdown options={primesInRange(3, 10000)} {...props}/>;
}
PublicModulusDropdown.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

/**
 * Dropdown of possible values for Bob's secret number.  Limited to integer
 * values in the range [0..k] where k is the public modulus.
 * Used by Bob and Eve.
 */
export function SecretNumberDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={_.range(0, publicModulus)} {...rest}/>;
}
SecretNumberDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
