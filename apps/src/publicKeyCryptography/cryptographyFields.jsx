/** @file Input fields specific to the cryptography widget */
import _ from 'lodash';
import React, {PropTypes} from 'react';
import classNames from 'classnames';
import IntegerDropdown from './IntegerDropdown';
import {primesInRange, privateKeyList} from './cryptographyMath';
import {LINE_HEIGHT, COLORS} from './style';

const BUTTON_VERTICAL_PADDING = 6;
const BUTTON_HORIZONTAL_PADDING = 12;

const style = {
  GoButton: {
    height: LINE_HEIGHT,
    lineHeight: `${LINE_HEIGHT - 2 * BUTTON_VERTICAL_PADDING}px`,
    padding: `${BUTTON_VERTICAL_PADDING}px ${BUTTON_HORIZONTAL_PADDING}px`,
    marginLeft: 5
  }
};

/**
 * Dropdown of possible private keys given a particular public modulus.
 * Used by Alice and Eve.
 */
export function PrivateKeyDropdown(props) {
  const {publicModulus, ...rest} = props;
  return (
    <IntegerDropdown
      className="private-key-dropdown"
      options={privateKeyList(publicModulus)}
      style={{backgroundColor: COLORS.privateKey}}
      {...rest}
    />);
}
PrivateKeyDropdown.propTypes = {
  publicModulus: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

/**
 * Dropdown of possible public modulus values, which should be all prime
 * numbers in the range [3..10000).  Used by all three characters.
 */
export function PublicModulusDropdown(props) {
  return (
    <IntegerDropdown
      className="public-modulus-dropdown"
      options={primesInRange(3, 10000)}
      style={{backgroundColor: COLORS.publicModulus}}
      {...props}
    />);
}
PublicModulusDropdown.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

/**
 * Dropdown of possible values for Bob's secret number.  Limited to integer
 * values in the range [0..k] where k is the public modulus.
 * Used by Bob and Eve.
 */
export function SecretNumberDropdown(props) {
  const {publicModulus, ...rest} = props;
  return (
    <IntegerDropdown
      className="secret-number-dropdown"
      options={_.range(0, publicModulus)}
      style={{backgroundColor: COLORS.secretNumber}}
      {...rest}
    />);
}
SecretNumberDropdown.propTypes = {
  publicModulus: PropTypes.number,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired
};

/**
 * Button for kicking off a computation in the Cryptography widget.
 * Used by Alice and Bob.
 */
export function GoButton(props) {
  const {className, ...rest} = props;
  return (
    <button
      className={classNames('primary', className)}
      style={style.GoButton}
      {...rest}
    >
      Go
    </button>);
}
GoButton.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

function Keyword(props) {
  const keywordStyle = {
    backgroundColor: props.color,
    fontWeight: 'bold',
    padding: 3
  };
  return <span style={keywordStyle}>{props.children}</span>;
}
Keyword.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired
};

export function KeywordPublicModulus() {
  return <Keyword color={COLORS.publicModulus}>public modulus</Keyword>;
}

export function KeywordPublicKey() {
  return <Keyword color={COLORS.publicKey}>public key</Keyword>;
}

export function KeywordPrivateKey() {
  return <Keyword color={COLORS.privateKey}>private key</Keyword>;
}

export function KeywordPublicNumber() {
  return <Keyword color={COLORS.publicNumber}>public number</Keyword>;
}

export function KeywordSecretNumber() {
  return <Keyword color={COLORS.secretNumber}>secret number</Keyword>;
}
