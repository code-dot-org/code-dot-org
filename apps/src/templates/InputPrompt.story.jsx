import React from 'react';
import InputPrompt from './InputPrompt';

export default {
  title: 'InputPrompt',
  component: InputPrompt
};

export const Default = (
  <InputPrompt
    question="What is your quest?"
    onInputReceived={() => {
      console.log('user input received');
    }}
  />
);
