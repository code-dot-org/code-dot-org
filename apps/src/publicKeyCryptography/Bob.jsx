/** @file The Bob character panel from the crypto widget */
import _ from 'lodash';
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import PublicModulusDropdown from './PublicModulusDropdown';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';

const Bob = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired,
    secretNumber: React.PropTypes.number,
    setSecretNumber: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicKey: null
    };
  },

  setPublicKey(publicKey) {
    this.setState({publicKey});
  },

  render() {
    const {
      publicModulus,
      setPublicModulus,
      secretNumber,
      setSecretNumber
    } = this.props;
    const {publicKey} = this.state;
    return (
      <CollapsiblePanel title="Bob">
        <NumberedSteps>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Enter Alice's public key: <IntegerTextbox value={publicKey} onChange={this.setPublicKey}/>
          </div>
          <div>
            Pick your secret number: <SecretNumberDropdown value={secretNumber} onChange={setSecretNumber} publicModulus={publicModulus}/>
          </div>
          <div>
            Calculate your public number:
            <div>
              (?? x ??)MOD ?? <button>Go</button>
            </div>
            <div>
              Your computed public number is ??
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Bob;

function SecretNumberDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={_.range(0, publicModulus)} {...rest}/>;
}
SecretNumberDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
