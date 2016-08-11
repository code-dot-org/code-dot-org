/** @file Character calculations, displayed side-by-side */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps from './NumberedSteps';

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
      <NumberedSteps>
        <div>
          Set a public modulus:
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

export function Bob() {
  return (
    <CollapsiblePanel title="Bob">
      <NumberedSteps>
        <div>
          Enter public modulus:
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
