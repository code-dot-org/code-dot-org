import React from 'react';

import InputPrompt from './InputPrompt';

export default {
  component: InputPrompt,
};

const Template = args => (
  <InputPrompt
    question="What is your quest?"
    onInputReceived={() => {
      console.log('user input received');
    }}
    {...args}
  />
);

export const Default = Template.bind({});
