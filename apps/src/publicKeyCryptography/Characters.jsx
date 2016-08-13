/** @file Character calculations, displayed side-by-side */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import {primesInRange, privateKeyList} from './cryptographyMath';

export const Alice = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    privateKey: React.PropTypes.number,
    publicKey: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired,
    setPrivateKey: React.PropTypes.func.isRequired
  },

  render() {
    const {
      publicModulus,
      privateKey,
      publicKey,
      setPublicModulus,
      setPrivateKey
    } = this.props;
    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>

          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Set a private key: <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={setPrivateKey}/>
            <br/>Your computed public key is {publicKey}
          </div>
          <div>
            Enter Bob's public number:
          </div>
          <div>
            Calculate Bob's secret number.
            <div>
              (?? x ?) MOD ??
              <button>Go</button>
            </div>
            <div>
              Bob's secret number is ??!
            </div>
          </div>
        </NumberedSteps>
      </CollapsiblePanel>);
  }
});

export const Eve = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    publicKey: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, publicKey, setPublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps>
          <div>
            Set a public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Enter Alice's public key: {publicKey}
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
    publicKey: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, publicKey, setPublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Bob">
        <NumberedSteps>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Enter Alice's public key: {publicKey}
          </div>
          <div>
            Pick your secret number:
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
  return <NumberDropdown options={primesInRange(3, 10000)} {...props}/>;
}
PublicModulusDropdown.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

function PrivateKeyDropdown(props) {
  const {publicModulus, ...rest} = props;
  return <NumberDropdown options={privateKeyList(publicModulus)} {...rest}/>;
}
PrivateKeyDropdown.propTypes = {
  publicModulus: React.PropTypes.number,
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};

const NumberDropdown = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
  },

  onChange(event) {
    const value = event.target.value;
    this.props.onChange(value === '' ? null : parseInt(value, 10));
  },

  render() {
    let {value, options} = this.props;
    if (typeof value !== 'number') {
      value = '';
    }
    return (
      <select value={value} onChange={this.onChange}>
        <option key="empty" value=""/>
        {options.map(n => <option key={n} value={n}>{n}</option>)}
      </select>);
  }
});

