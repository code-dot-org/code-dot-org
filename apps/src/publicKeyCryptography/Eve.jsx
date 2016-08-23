/** @file The Eve character from the cryptography widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import ValidatorField from './ValidatorField';
import {
  PrivateKeyDropdown,
  PublicModulusDropdown,
  SecretNumberDropdown
} from './cryptographyFields';

const Eve = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired,
    runModuloClock: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      publicKey: null,
      privateKey: null,
      publicNumber: null,
      secretNumber: null,
      checkingPrivateKey: false,
      privateKeyEquationResult: null,
      checkingSecretNumber: false,
      secretNumberEquationResult: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPublicKey(publicKey) {
    this.setState({publicKey});
  },

  setPrivateKey(privateKey) {
    const {runModuloClock} = this.props;
    const {publicKey, publicModulus} = this.state;
    this.setState({privateKey});
    if ([publicKey, privateKey, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * privateKey;
      const privateKeyEquationResult = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({
          privateKeyEquationResult: currentDividend % publicModulus,
          checkingPrivateKey: true
        });
      }, () => {
        this.setState({
          privateKeyEquationResult,
          checkingPrivateKey: false
        });
      });
    } else {
      this.setState({privateKey: null, privateKeyEquationResult: null});
    }
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  setSecretNumber(secretNumber) {
    this.setState({secretNumber});
    const {runModuloClock} = this.props;
    const {publicKey, publicModulus} = this.state;
    this.setState({secretNumber});
    if ([publicKey, secretNumber, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * secretNumber;
      const secretNumberEquationResult = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({
          secretNumberEquationResult: currentDividend % publicModulus,
          checkingSecretNumber: true
        });
      }, () => {
        this.setState({
          secretNumberEquationResult,
          checkingSecretNumber: false
        });
      });
    } else {
      this.setState({secretNumber: null, secretNumberEquationResult: null});
    }
  },

  render() {
    const {
      publicModulus,
      publicKey,
      privateKey,
      publicNumber,
      secretNumber,
      checkingPrivateKey,
      privateKeyEquationResult,
      checkingSecretNumber,
      secretNumberEquationResult
    } = this.state;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps>
          <div>
            Set a public modulus: <PublicModulusDropdown value={publicModulus} onChange={this.onPublicModulusChange}/>
          </div>
          <div>
            Enter Alice's public key: <IntegerTextbox value={publicKey} onChange={this.setPublicKey}/>
          </div>
          <div>
            Crack Alice's private key:
            <div>
              {'('}
              <IntegerField value={publicKey}/>
              {' x '}
              <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={this.setPrivateKey}/>
              {') MOD '}
              <IntegerField value={publicModulus}/> = 1
              {' '}
              <ValidatorField value={privateKeyEquationResult} expectedValue={1} shouldEvaluate={!checkingPrivateKey}/>
            </div>
          </div>
          <div>
            Enter Bob's public number: <IntegerTextbox value={publicNumber} onChange={this.setPublicNumber}/>
          </div>
          <div>
            Crack Bob's secret number:
            <div>
              {'('}
              <IntegerField value={publicKey}/>
              {' x '}
              <SecretNumberDropdown value={secretNumber} onChange={this.setSecretNumber} publicModulus={publicModulus}/>
              {') MOD '}
              <IntegerField value={publicModulus}/>
              {' = '}
              <IntegerField value={publicNumber}/>
              {' '}
              <ValidatorField value={secretNumberEquationResult} expectedValue={publicNumber} shouldEvaluate={!checkingSecretNumber}/>
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Eve;
