import React from 'react';

import reactBootstrapStoryDecorator from '../reactBootstrapStoryDecorator';

import VariableFormGroup from './VariableFormGroup';

export default {
  component: VariableFormGroup,
  decorators: [reactBootstrapStoryDecorator],
};

const Template = args => {
  return <VariableFormGroup {...args} />;
};

export const BasicUncontrolledVariableFormGroup = Template.bind({});
BasicUncontrolledVariableFormGroup.args = {
  sourceLabel: 'Who should go on the away mission?',
  sourceName: 'roster',
  sourceValues: [
    'an essential member of the bridge crew',
    'an absolutely valueless redshirt',
    'someone whose actual job is to go on away missions',
  ],
  columnVariableQuestions: [
    {
      label: 'is this person qualified for the mission?',
      name: 'qualified',
      required: true,
      type: 'radio',
      values: ['Yes', 'Not remotely'],
    },
    {
      label: "can the ship afford to risk this person's life?",
      name: 'risk',
      required: true,
      type: 'radio',
      values: ['Yes', 'We would all literally die without them'],
    },
  ],
  rowVariableQuestions: [
    {
      label: 'why are you selecing {value} for this mission?',
      name: 'why',
      required: false,
      type: 'free_response',
    },
  ],
};
