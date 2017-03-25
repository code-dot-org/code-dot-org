/** @file Static instructions for the Alice character in the crypto widget */
import React from 'react';
import CharacterPanel from './CharacterPanel';
import NumberedSteps, {Step, SubStep} from './NumberedSteps';

export default function AliceInstructions() {
  return (
    <CharacterPanel title="Alice's instructions">
      <NumberedSteps>
        <Step>
          <b>Choose a public modulus from the list</b>
          <ul>
            <SubStep text="Announce this number to Eve and Bob"/>
          </ul>
        </Step>
        <Step>
          <b>Choose a private key to use</b>
          <ul>
            <SubStep text="Keep your private key a secret!"/>
            <SubStep text="Your public key has been calculated for you"/>
            <SubStep text="Announce your public key to Eve and Bob"/>
          </ul>
        </Step>
        <Step>
          <b>Wait for Bob to announce his public number</b>
          <ul>
            <SubStep text="Enter Bob’s public number once he announces it"/>
          </ul>
        </Step>
        <Step>
          <b>Calculate Bob's secret number!</b>
          <ul>
            <SubStep text="This is the number Bob is trying to send to you!"/>
          </ul>
        </Step>
      </NumberedSteps>
    </CharacterPanel>
  );
}
