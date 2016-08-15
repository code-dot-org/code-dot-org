/** @file The Eve character from the cryptography widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import PublicModulusDropdown from './PublicModulusDropdown';
import IntegerTextbox from './IntegerTextbox';

const Eve = React.createClass({
  propTypes: {
    setPublicModulus: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      publicModulus: null,
      publicKey: null
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

  setPublicNumber(publicNumber) {
    this.setState({publicNumber});
  },

  render() {
    const {
      publicModulus,
      publicKey
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
