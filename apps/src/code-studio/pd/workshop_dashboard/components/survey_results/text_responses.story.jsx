import React from 'react';
import TextResponses from './text_responses';
import reactBootstrapStoryDecorator from '../../../reactBootstrapStoryDecorator';

export default storybook => {
  storybook
    .storiesOf('Text responses', module)
    .addDecorator(reactBootstrapStoryDecorator)
    .addStoryTable([
      {
        name: 'General text responses',
        story: () => (
          <TextResponses
            question="What is your favorite food?"
            answers={['Tacos', 'Pizza', 'Burritos', 'Vegetable Fried Rice']}
          />
        )
      },
      {
        name: 'Facilitator specific text responses',
        story: () => (
          <TextResponses
            question="What snacks do you want your facilitator to bring?"
            answers={{
              'Facilitator 1': ['Chips', 'Apples', 'Nachos', 'Nachos', 'Cookies'],
              'Facilitator 2': ['Fries', 'Carrots', 'Carrots', 'Peppers', 'Donuts']
            }}
          />
        )
      },
      {
        name: 'General responses with an average',
        story: () => (
          <TextResponses
            question="How many tacos do you want?"
            answers={['1', '2', '3', '6', '3', '3', '2', '0', 'Dunno']}
            showAverage={true}
          />
        )
      },
      {
        name: 'Facilitator responses with averages',
        story: () => (
          <TextResponses
            question="On a scale of 1 to 5, how good was the facilitator's cooking?"
            answers={{
              'Facilitator 1': ['3', '4', '5', '5', '4', '5', '5'],
              'Facilitator 2': ['2', '3', '1', '1', '1', '2', 'Dunno']
            }}
            showAverage={true}
          />
        )
      }
    ]);
};
