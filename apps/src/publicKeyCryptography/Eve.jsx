/** @file The Eve character from the cryptography widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import PublicModulusDropdown from './PublicModulusDropdown';
import IntegerTextbox from './IntegerTextbox';

const Eve = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired
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
    const {publicModulus, setPublicModulus} = this.props;
    const {publicKey} = this.state;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps>
          <div>
            Set a public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Enter Alice's public key: <IntegerTextbox value={publicKey} onChange={this.setPublicKey}/>
          </div>
          <div>
            Crack Alice's private key:
            <div>
              (?? x ??)MOD ?? = 1 (??)
            </div>
          </div>
          <div>
            Enter Bob's public number: ??
          </div>
          <div>
            Crack Bob's secret number:
            <div>
              (?? x ??)MOD ?? = ?? (??)
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});
export default Eve;
