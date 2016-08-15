/** @file The Alice character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import PublicModulusDropdown from './PublicModulusDropdown';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';
import {computePublicKey, privateKeyList} from './cryptographyMath';

const Alice = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired,
    setPublicKey: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      privateKey: null,
      publicNumber: null
    };
  },

  setPublicModulus(publicModulus) {
    this.setState({publicModulus});
    this.setPrivateKey(null);
  },

  onPublicModulusChange(publicModulus) {
    this.setPublicModulus(publicModulus);
    this.props.setPublicModulus(publicModulus);
  },

  setPrivateKey(privateKey) {
    const {publicModulus} = this.state;
    this.setState({privateKey});
    this.props.setPublicKey(this.getPublicKey({privateKey, publicModulus}));
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  getPublicKey({privateKey, publicModulus}) {
    return privateKey && publicModulus ? computePublicKey(privateKey, publicModulus) : null;
  },

  render() {
    const {
      publicModulus,
      privateKey,
      publicNumber
    } = this.state;
    const publicKey = this.getPublicKey({privateKey, publicModulus});
    const secretNumber = (publicNumber * privateKey) % publicModulus;

    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>
          <div>
            Enter public modulus:
            <PublicModulusDropdown value={publicModulus} onChange={this.onPublicModulusChange}/>
          </div>
          <div>
            Set a private key:
            <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={this.setPrivateKey}/>
            <div>Your computed public key is {publicKey}</div>
          </div>
          <div>
            Enter Bob's public number:
            <IntegerTextbox value={publicNumber} onChange={this.setPublicNumber}/>
          </div>
          <div>
            Calculate Bob's secret number.
            <div>
              ({publicNumber} x {privateKey}) MOD {publicModulus}
              <button>Go</button>
            </div>
            <div>
              Bob's secret number is {secretNumber}!
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Alice;

function PrivateKeyDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={privateKeyList(publicModulus)} {...rest}/>;
}
PrivateKeyDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
