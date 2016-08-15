/** @file Character calculations, displayed side-by-side */
import React from 'react';
import color from '../color';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';
import {primesInRange, privateKeyList} from './cryptographyMath';

/** @const {number} Line height for numbered steps, helps align input fields */
const LINE_HEIGHT = 30;

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
        <NumberedSteps lineHeight={LINE_HEIGHT}>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={setPublicModulus}/>
          </div>
          <div>
            Set a private key: <PrivateKeyDropdown publicModulus={publicModulus} value={privateKey} onChange={setPrivateKey}/>
            <div>Your computed public key is {publicKey}</div>
          </div>
          <div>
            Enter Bob's public number: <NumberTextbox value={publicNumber} onChange={this.setPublicNumber}/>
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
    publicKey: React.PropTypes.number,
    setPublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, publicKey, setPublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps lineHeight={LINE_HEIGHT}>
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
        <NumberedSteps lineHeight={LINE_HEIGHT}>
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

const NumberDropdownStyle = {
  width: 100,
  height: Math.min(LINE_HEIGHT, 24),
  // lineHeight does not get the automatic 'px' suffix
  // see https://facebook.github.io/react/tips/style-props-value-px.html
  lineHeight: `${LINE_HEIGHT}px`,
  verticalAlign: 'middle',
  marginBottom: 0,
  paddingTop: 2,
  paddingBottom: 2,
  borderRadius: 4,
  color: color.charcoal,
  border: `1px solid ${color.lighter_gray}`,
  backgroundColor: color.white
};

const NumberDropdown = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.arrayOf(React.PropTypes.number).isRequired
  },

  onChange(event) {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(typeof value === 'number' && !isNaN(value) ? value : null);
  },

  render() {
    let {value, options} = this.props;
    if (typeof value !== 'number') {
      value = '';
    }
    return (
      <select style={NumberDropdownStyle} value={value} onChange={this.onChange}>
        <option key="empty" value=""/>
        {options.map(n => <option key={n} value={n}>{n}</option>)}
      </select>);
  }
});

const NumberTextbox = React.createClass({
  propTypes: {
    value: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired
  },

  onChange(event) {
    const value = parseInt(event.target.value, 10);
    this.props.onChange(typeof value === 'number' && !isNaN(value) ? value : null);
  },

  render() {
    let {value} = this.props;
    if (typeof value !== 'number') {
      value = '';
    }
    return <input value={value} onChange={this.onChange}/>;
  }
});
