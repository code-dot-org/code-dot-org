import React from 'react';
import VariableFormGroup from './VariableFormGroup';
import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('FormComponents/VariableFormGroup', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([{
      name: 'basic uncontrolled VariableFormGroup',
      story: () => (
        <VariableFormGroup
          sourceLabel="Who should go on the away mission?"
          sourceName="roster"
          sourceValues={[
            "an essential member of the bridge crew",
            "an absolutely valueless redshirt",
            "someone whose actual job is to go on away missions"
          ]}

          columnVariableQuestions={[{
            label: "is this person qualified for the mission?",
            name: "qualified",
            required: true,
            type: "radio",
            values: ["Yes", "Not remotely"]
          }, {
            label: "can the ship afford to risk this person's life?",
            name: "risk",
            required: true,
            type: "radio",
            values: ["Yes", "We would all literally die without them"]
          }]}

          rowVariableQuestions={[{
            label: "why are you selecing {value} for this mission?",
            name: "why",
            required: false,
            type: "free_response"
          }]}
        />
      )
    }]);
};
