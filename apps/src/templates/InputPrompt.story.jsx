import React from 'react';
import InputPrompt from './InputPrompt';

export default storybook => {
  return storybook
    .storiesOf('InputPrompt', module)
    .addStoryTable([
      {
        name: 'Input Prompt',
        description: `Example simple input prompt to take in user  input`,
        story: () => (
          <InputPrompt
            question="What is your quest?"
            onInputReceived={() => {console.log("user input received");}}
          />
        )
      }
    ]);
};
