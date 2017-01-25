/** @file Static instructions for the Eve character in the crypto widget */
import React from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import NumberedSteps, {Step, SubStep} from './NumberedSteps';

export default function EveInstructions() {
  return (
    <CollapsiblePanel title="Eve's instructions">
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
    </CollapsiblePanel>
  );
}

const style = {
  header: {
    fontSize: 'larger',
    fontWeight: 'bold',
    marginTop: 10
  },
  subheader: {
    fontStyle: 'italic',
    marignBottom: 10
  }
};

const Heading = ({text}) => (
  <div style={style.header}>
    {text}
  </div>
);
Heading.propTypes = {
  text: React.PropTypes.string.isRequired
};

const Subheading = ({text}) => (
  <div style={style.subheader}>
    {text}
  </div>
);
Subheading.propTypes = {...Heading.propTypes};
