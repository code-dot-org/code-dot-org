/** @file The Alice character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {PrivateKeyDropdown, PublicModulusDropdown} from './cryptographyFields';
import {computePublicKey} from './cryptographyMath';

const Alice = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired,
    setPublicKey: React.PropTypes.func.isRequired,
    runModuloClock: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      privateKey: null,
      publicNumber: null,
      secretNumber: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
    this.setPrivateKey(null);
    this.clearSecretNumber();
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPrivateKey(privateKey) {
    this.setState({privateKey});
    this.clearSecretNumber();
  },

  onPrivateKeyChange(privateKey) {
    const {publicModulus} = this.state;
    this.setPrivateKey(privateKey);
    this.props.setPublicKey(this.getPublicKey({privateKey, publicModulus}));
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
    this.clearSecretNumber();
  },

  getPublicKey({privateKey, publicModulus}) {
    return privateKey && publicModulus ? computePublicKey(privateKey, publicModulus) : null;
  },

  computeSecretNumber() {
    const {runModuloClock} = this.props;
    const {publicModulus, privateKey, publicNumber} = this.state;
    if ([publicModulus, privateKey, publicNumber].every(Number.isInteger)) {
      const dividend = publicNumber * privateKey;
      const secretNumber = dividend % publicModulus;
      runModuloClock(dividend, currentDividend => {
        this.setState({secretNumber: currentDividend % publicModulus});
      }, () => {
        this.setState({secretNumber});
      });
    } else {
      this.clearSecretNumber();
    }
  },

  clearSecretNumber() {
    this.setState({secretNumber: null});
  },

  render() {
    const {
      publicModulus,
      privateKey,
      publicNumber,
      secretNumber
    } = this.state;
    const publicKey = this.getPublicKey({privateKey, publicModulus});

    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>
          <div>
            Enter public modulus:
            <PublicModulusDropdown value={publicModulus} onChange={this.onPublicModulusChange}/>
          </div>
          <div>
            Set a private key:
            <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={this.onPrivateKeyChange}/>
            <div>Your computed public key is <IntegerField value={publicKey}/></div>
          </div>
          <div>
            Enter Bob's public number:
            <IntegerTextbox value={publicNumber} onChange={this.setPublicNumber}/>
          </div>
          <div>
            Calculate Bob's secret number.
            <div>
              (<IntegerField value={publicNumber}/> x <IntegerField value={privateKey}/>) MOD <IntegerField value={publicModulus}/>
              <button onClick={this.computeSecretNumber}>Go</button>
            </div>
            <div>
              Bob's secret number is <IntegerField value={secretNumber}/>!
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Alice;
