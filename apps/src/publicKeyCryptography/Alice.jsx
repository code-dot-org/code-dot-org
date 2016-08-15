/** @file The Alice character panel from the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import PublicModulusDropdown from './PublicModulusDropdown';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';
import {privateKeyList} from './cryptographyMath';

const Alice = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    privateKey: React.PropTypes.number,
    publicKey: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired,
    setPrivateKey: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicNumber: null
    };
  },

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  render() {
    const {
      publicModulus,
      privateKey,
      publicKey,
      setPublicModulus,
      setPrivateKey
    } = this.props;
    const {
      publicNumber
    } = this.state;
    const secretNumber = (publicNumber * privateKey) % publicModulus;

    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Set a private key: <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={setPrivateKey}/>
            <div>Your computed public key is {publicKey}</div>
          </div>
          <div>
            Enter Bob's public number: <IntegerTextbox value={publicNumber} onChange={this.setPublicNumber}/>
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
