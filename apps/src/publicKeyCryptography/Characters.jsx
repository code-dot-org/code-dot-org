/** @file Character calculations, displayed side-by-side */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';

export const Alice = React.createClass({
  propTypes: {
    publicModulus: React.PropTypes.number,
    onChangePublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, onChangePublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Alice">
        <NumberedSteps>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={onChangePublicModulus}/>
          </div>
          <div>
            Set a private key
            <br/>Your computed public key is ??
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
    onChangePublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, onChangePublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Eve">
        <NumberedSteps>
          <div>
            Set a public modulus: <PublicModulusDropdown value={publicModulus} onChange={onChangePublicModulus}/>
          </div>
          <div>
            Enter Alice's public key
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
    onChangePublicModulus: React.PropTypes.func.isRequired
  },

  render() {
    const {publicModulus, onChangePublicModulus} = this.props;
    return (
      <CollapsiblePanel title="Bob">
        <NumberedSteps>
          <div>
            Enter public modulus: <PublicModulusDropdown value={publicModulus} onChange={onChangePublicModulus}/>
          </div>
          <div>
            Enter Alice's public key:
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
  return (
    <select value={props.value} onChange={props.onChange}>
      <option value=""></option>
      <option value="3">3</option>
      <option value="5">5</option>
      <option value="7">7</option>
    </select>
  );
}
PublicModulusDropdown.propTypes = {
  value: React.PropTypes.number,
  onChange: React.PropTypes.func.isRequired
};
