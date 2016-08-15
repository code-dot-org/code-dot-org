/** @file Character calculations, displayed side-by-side */
import _ from 'lodash';
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import IntegerDropdown from './IntegerDropdown';
import IntegerTextbox from './IntegerTextbox';
import {primesInRange, privateKeyList} from './cryptographyMath';

export const Alice = React.createClass({
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

export const Eve = React.createClass({
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

export const Bob = React.createClass({
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

function PublicModulusDropdown(props) {
  return <IntegerDropdown options={primesInRange(3, 10000)} {...props}/>;
}
PublicModulusDropdown.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

function PrivateKeyDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={privateKeyList(publicModulus)} {...rest}/>;
}
PrivateKeyDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

function SecretNumberDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <IntegerDropdown options={_.range(0, publicModulus)} {...rest}/>;
}
SecretNumberDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
