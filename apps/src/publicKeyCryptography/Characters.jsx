/** @file Character calculations, displayed side-by-side */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';

const style = {
  alice: {
    backgroundColor: 'red',
    height: 200,
  },
  eve: {
    backgroundColor: 'green',
    height: 200,
  },
  bob: {
    backgroundColor: 'blue',
    height: 200,
  }
};

export function Alice() {
  return (
    <CollapsiblePanel title="Alice">
      <NumberedSteps>
        <div>
          Enter public modulus
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
            (?? x ?) MOD ?? <button>Go</button>
          </div>
          <div>
            Bob's secret number is ??!
          </div>
        </div>
      </NumberedSteps>
    </CollapsiblePanel>);
}

export function Eve() {
  return (
    <CollapsiblePanel title="Eve">
      <div style={style.eve}/>
    </CollapsiblePanel>);
}

export function Bob() {
  return (
    <CollapsiblePanel title="Bob">
      <div style={style.bob}/>
    </CollapsiblePanel>);
}
