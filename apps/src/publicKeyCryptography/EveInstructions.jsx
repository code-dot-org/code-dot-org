/** @file Static instructions for the Eve character in the crypto widget */
import React from 'react';
import CharacterPanel from './CharacterPanel';
import NumberedSteps, {Step, SubStep, Heading, Subheading} from './NumberedSteps';

export default function EveInstructions() {
  return (
    <CharacterPanel title="Eve's instructions">
      <Heading text="Eavesdrop!"/>
      <Subheading text="Listen for and collect the numbers that Alice and Bob announce in public"/>
      <NumberedSteps>
        <Step>
          <b>Wait for Alice to announce the public modulus</b>
          <ul>
            <SubStep text="Enter the public modulus once Alice announces it"/>
          </ul>
        </Step>
        <Step>
          <b>Wait for Alice to announce her public key</b>
          <ul>
            <SubStep text="Enter Alice’s public key once she announces it"/>
          </ul>
        </Step>
        <Step>
          <b>Wait for Bob to announce his public number</b>
          <ul>
            <SubStep text="Enter Bob’s public number once he announces it."/>
          </ul>
        </Step>
      </NumberedSteps>
      <Heading text="Try to Crack it!"/>
      <Subheading text="With the information you have, try to crack Alice’s private key and Bob’s secret number."/>
      <NumberedSteps start={4}>
        <Step>
          <b>Try to crack Alice’s private key</b>
          <ul>
            <SubStep text="Figure out what number would make the equation equal 1"/>
          </ul>
        </Step>
        <Step>
          <b>Try to crack Bob’s secret number</b>
          <ul>
            <SubStep text="Figure out what number would make the equation equal Bob’s secret number"/>
          </ul>
        </Step>
      </NumberedSteps>
    </CharacterPanel>
  );
}
