import React from 'react';

import ButtonList from './ButtonList';

export default {
  component: ButtonList,
};

const Template = args => <ButtonList {...args} />;

export const RadioButtons = Template.bind({});
RadioButtons.args = {
  type: 'radio',
  label: 'What is your favorite pet?',
  groupName: 'favoritePet',
  answers: ['Cat', 'Dog'],
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  type: 'check',
  label: 'What is your favorite pet?',
  groupName: 'favoritePet',
  answers: ['Cat', 'Dog'],
};

export const CheckboxesIncludeOther = Template.bind({});
CheckboxesIncludeOther.args = {
  type: 'check',
  label: 'What is your favorite pet?',
  groupName: 'favoritePet',
  answers: ['Cat', 'Dog'],
  includeOther: true,
};

export const CheckboxesWithCustom = Template.bind({});
CheckboxesWithCustom.args = {
  type: 'check',
  label: 'What is your favorite pet?',
  groupName: 'favoritePet',
  answers: [
    'Cat',
    {
      answerText: 'Specific dog breed',
      inputId: 'dog-breed-input',
    },
  ],
};
