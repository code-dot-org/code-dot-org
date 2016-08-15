/** @file The Eve character from the cryptography widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {
  PrivateKeyDropdown,
  PublicModulusDropdown,
  SecretNumberDropdown
} from './cryptographyFields';

const Eve = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      publicKey: null,
      privateKey: null,
      publicNumber: null,
      secretNumber: null
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
    this.setState({privateKey});
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  setSecretNumber(secretNumber) {
    this.setState({secretNumber});
  },

  render() {
    const {
      publicModulus,
      publicKey,
      privateKey,
      publicNumber,
      secretNumber
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
              (<IntegerField value={publicKey}/> x <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={this.setPrivateKey}/>)MOD <IntegerField value={publicModulus}/> = 1 (??)
            </div>
          </div>
          <div>
            Enter Bob's public number: <IntegerTextbox value={publicNumber} onChange={this.setPublicNumber}/>
          </div>
          <div>
            Crack Bob's secret number:
            <div>
              (<IntegerField value={publicKey}/> x <SecretNumberDropdown value={secretNumber} onChange={this.setSecretNumber} publicModulus={publicModulus}/>)MOD <IntegerField value={publicModulus}/>  = <IntegerField value={publicNumber}/> (??)
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Eve;
