/** @file The Bob character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerField from './IntegerField';
import IntegerTextbox from './IntegerTextbox';
import {PublicModulusDropdown, SecretNumberDropdown} from './cryptographyFields';

const Bob = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired,
    setPublicNumber: React.PropTypes.func.isRequired
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
    const {publicKey, publicModulus} = this.state;
    this.setState({secretNumber});
    this.clearPublicNumber();
  },

  computePublicNumber() {
    const {publicKey, secretNumber, publicModulus} = this.state;
    const publicNumber = [publicKey, secretNumber, publicModulus].every(Number.isInteger) ?
        ((publicKey * secretNumber) % publicModulus) : null;
    this.setState({publicNumber});
    this.props.setPublicNumber(publicNumber);
  },

  clearPublicNumber() {
    this.setState({publicNumber: null});
  },

  render() {
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
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={this.onPublicModulusChange}/>
          </div>
          <div>
            Enter Alice's public key: <IntegerTextbox value={publicKey} onChange={this.setPublicKey}/>
          </div>
          <div>
            Pick your secret number: <SecretNumberDropdown value={secretNumber} onChange={this.setSecretNumber} publicModulus={publicModulus}/>
          </div>
          <div>
            Calculate your public number:
            <div>
              (<IntegerField value={publicKey}/> x <IntegerField value={secretNumber}/>)MOD <IntegerField value={publicModulus}/>
              <button onClick={this.computePublicNumber}>Go</button>
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
