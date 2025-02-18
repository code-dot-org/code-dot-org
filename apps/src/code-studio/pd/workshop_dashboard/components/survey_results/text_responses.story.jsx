import React from 'react';

import TextResponses from './text_responses';

export default {
  component: TextResponses,
};

const Template = args => <TextResponses {...args} />;

export const GeneralTextResponses = Template.bind({});
GeneralTextResponses.args = {
  name: 'General text responses',
  question: 'What is your favorite food?',
  answers: ['Tacos', 'Pizza', 'Burritos', 'Vegetable Fried Rice'],
};

export const FacilitatorSpecificTextResponses = Template.bind({});
FacilitatorSpecificTextResponses.args = {
  name: 'Facilitator specific text responses',
  question: 'What snacks do you want your facilitator to bring?',
  answers: {
    'Facilitator 1': ['Chips', 'Apples', 'Nachos', 'Nachos', 'Cookies'],
    'Facilitator 2': ['Fries', 'Carrots', 'Carrots', 'Peppers', 'Donuts'],
  },
};

export const GeneralResponsesWithAnAverage = Template.bind({});
GeneralResponsesWithAnAverage.args = {
  name: 'General responses with an average',
  question: 'How many tacos do you want?',
  answers: ['1', '2', '3', '6', '3', '3', '2', '0', 'Dunno'],
  showAverage: true,
};

export const FacilitatorResponsesWithAverages = Template.bind({});
FacilitatorResponsesWithAverages.args = {
  name: 'Facilitator responses with averages',
  question: "On a scale of 1 to 5, how good was the facilitator's cooking?",
  answers: {
    'Facilitator 1': ['3', '4', '5', '5', '4', '5', '5'],
    'Facilitator 2': ['2', '3', '1', '1', '1', '2', 'Dunno'],
  },
  showAverage: true,
};
