/** @file Static instructions for the Bob character in the crypto widget */
import React from 'react';

import CharacterPanel from './CharacterPanel';
import NumberedSteps, {Step, SubStep} from './NumberedSteps';

export default function BobInstructions() {
  return (
    <CharacterPanel title="Bob's instructions">
      <NumberedSteps>
        <Step>
          <b>Wait for Alice to announce the public modulus</b>
          <ul>
            <SubStep text="Enter the public modulus once Alice announces it" />
          </ul>
        </Step>
        <Step>
          <b>Wait for Alice to announce her public key</b>
          <ul>
            <SubStep text="Enter Alice’s public key once she announces it" />
          </ul>
        </Step>
        <Step>
          <b>Choose a secret number to send to Alice</b>
          <ul>
            <SubStep text="Keep it secret." />
          </ul>
        </Step>
        <Step>
          <b>Calculate your public number</b>
          <ul>
            <SubStep text="This is the encrypted version of the secret number" />
            <SubStep text="Announce this number out loud to Alice and Eve" />
          </ul>
        </Step>
      </NumberedSteps>
    </CharacterPanel>
  );
}
