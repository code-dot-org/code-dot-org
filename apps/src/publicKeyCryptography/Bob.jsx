/** @file The Bob character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {PublicModulusDropdown, SecretNumberDropdown, GoButton} from './cryptographyFields';

const Bob = React.createClass({
  propTypes: {
    disabled: React.PropTypes.bool,
    setPublicModulus: React.PropTypes.func.isRequired,
    setPublicNumber: React.PropTypes.func.isRequired,
    runModuloClock: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      publicKey: null,
      secretNumber: null,
      publicNumber: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
    this.setSecretNumber(null);
    this.clearPublicNumber();
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPublicKey(publicKey) {
    this.setState({publicKey});
    this.clearPublicNumber();
  },

  setSecretNumber(secretNumber) {
    this.setState({secretNumber});
    this.clearPublicNumber();
  },

  computePublicNumber() {
    const {runModuloClock} = this.props;
    const {publicKey, secretNumber, publicModulus} = this.state;
    if ([publicKey, secretNumber, publicModulus].every(Number.isInteger)) {
      const dividend = publicKey * secretNumber;
      const publicNumber = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({publicNumber: currentDividend % publicModulus});
      }, () => {
        this.setState({publicNumber});
        this.props.setPublicNumber(publicNumber);
      });
    } else {
      this.clearPublicNumber();
    }
  },

  clearPublicNumber() {
    this.setState({publicNumber: null});
  },

  render() {
    const {disabled} = this.props;
    const {
      publicModulus,
      publicKey,
      secretNumber,
      publicNumber
    } = this.state;
    return (
      <CollapsiblePanel title="Bob">
        <NumberedSteps>
          <div>
            Enter public modulus:
            <PublicModulusDropdown
              value={publicModulus}
              onChange={this.onPublicModulusChange}
              disabled={disabled}
            />
          </div>
          <div>
            Enter Alice's public key:
            <IntegerTextbox
              value={publicKey}
              onChange={this.setPublicKey}
              disabled={disabled}
            />
          </div>
          <div>
            Pick your secret number:
            <SecretNumberDropdown
              value={secretNumber}
              onChange={this.setSecretNumber}
              publicModulus={publicModulus}
              disabled={disabled}
            />
          </div>
          <div>
            Calculate your public number:
            <div>
              (<IntegerField value={publicKey}/> x <IntegerField value={secretNumber}/>)MOD <IntegerField value={publicModulus}/>
              <GoButton
                onClick={this.computePublicNumber}
                disabled={disabled}
              />
            </div>
            <div>
              Your computed public number is <IntegerField value={publicNumber}/>
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Bob;
