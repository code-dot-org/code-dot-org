import React from 'react';

import ChoiceResponses from './choice_responses';

export default {
  component: ChoiceResponses,
};

const Template = args => <ChoiceResponses {...args} />;

export const ChoiceResponsesWithoutOther = Template.bind({});
ChoiceResponsesWithoutOther.args = {
  name: 'Choice responses without other',
  question: 'What is your favorite pizza topping?',
  answers: {
    Peppers: 4,
    Onions: 13,
    Mushrooms: 2,
    Olives: 2,
    Sausage: 3,
  },
  possibleAnswers: [
    'Peppers',
    'Onions',
    'Mushrooms',
    'Sausage',
    'Olives',
    'Pineapples',
  ],
  answerType: 'selectText',
};

export const ChoiceResponsesWithOthers = Template.bind({});
ChoiceResponsesWithOthers.args = {
  name: 'Choice responses with others',
  question:
    'What is your favorite pizza topping? Please provide the topping if it is not listed here',
  answers: {
    Peppers: 4,
    Onions: 13,
    Mushrooms: 2,
    Olives: 2,
    Sausage: 3,
    Corn: 1,
    'Anything but pineapples lol': 1,
    'Kalamata Olives specifically': 1,
  },
  possibleAnswers: [
    'Peppers',
    'Onions',
    'Mushrooms',
    'Sausage',
    'Olives',
    'Pineapples',
  ],
  otherText: 'Other toppings',
  answerType: 'selectText',
};

export const ChoiceSelectValueResponse = Template.bind({});
ChoiceSelectValueResponse.args = {
  name: 'Choice selectValue response',
  question: 'What do you think about pineapples on pizza?',
  answers: {
    1: 10,
    2: 5,
    3: 1,
    4: 0,
    5: 0,
  },
  answerType: 'selectValue',
  possibleAnswers: ['Abhorrent', 'Not good', 'Ambivalent', 'Good', 'Delicious'],
};

export const ScaleRatings = Template.bind({});
ScaleRatings.args = {
  name: 'Scale ratings',
  question: 'How do you feel about deep dish?',
  answers: {
    1: 1,
    4: 5,
    5: 10,
  },
  answerType: 'scale',
  possibleAnswers: ['1 - I hate it', '2', '3', '4', '5 - I love it'],
};

export const ChoiceResponsesForOnlyOneFacilitator = Template.bind({});
ChoiceResponsesForOnlyOneFacilitator.args = {
  name: 'Choice responses for only one facilitator',
  question: 'What is your favorite pizza topping?',
  perFacilitator: true,
  answers: {
    Tom: {
      Peppers: 4,
      Mushrooms: 2,
      Olives: 2,
      Sausage: 3,
    },
  },
  possibleAnswers: [
    'Peppers',
    'Onions',
    'Mushrooms',
    'Sausage',
    'Olives',
    'Pineapples',
  ],
  answerType: 'selectText',
};

export const ChoiceResponsesWithoutOtherPerFacilitator = Template.bind({});
ChoiceResponsesWithoutOtherPerFacilitator.args = {
  name: 'Choice responses without other per facilitator',
  question: 'What is your favorite pizza topping?',
  perFacilitator: true,
  answers: {
    Tom: {
      Peppers: 4,
      Mushrooms: 2,
      Olives: 2,
      Sausage: 3,
    },
    Dick: {
      Peppers: 4,
      Onions: 13,
      Sausage: 3,
    },
    Harry: {
      Pineapples: 5,
      Onions: 5,
    },
  },
  possibleAnswers: [
    'Peppers',
    'Onions',
    'Mushrooms',
    'Sausage',
    'Olives',
    'Pineapples',
  ],
  answerType: 'selectText',
};

export const ChoiceResponsesWithOthersPerFacilitator = Template.bind({});
ChoiceResponsesWithOthersPerFacilitator.args = {
  name: 'Choice responses with others',
  question:
    'What is your favorite pizza topping? Please provide the topping if it is not listed here',
  perFacilitator: true,
  answers: {
    Tom: {
      Peppers: 4,
      Onions: 13,
      Mushrooms: 2,
      Olives: 2,
      Sausage: 3,
      Corn: 1,
      'Anything but pineapples lol': 1,
      'Kalamata Olives specifically': 1,
    },
    Dick: {
      'Pepperoni and literally nothing else': 1,
    },
    Harry: {
      Peppers: 16,
      Onions: 17,
      Mushrooms: 8,
      Sausage: 16,
      Olives: 12,
      Pineapples: 14,
    },
  },
  possibleAnswers: [
    'Peppers',
    'Onions',
    'Mushrooms',
    'Sausage',
    'Olives',
    'Pineapples',
  ],
  otherText: 'Other toppings',
  answerType: 'selectText',
};

export const ChoiceSelectValueResponsePerFacilitator = Template.bind({});
ChoiceSelectValueResponsePerFacilitator.args = {
  name: 'Choice selectValue response',
  question: 'What do you think about pineapples on pizza?',
  perFacilitator: true,
  answers: {
    Tom: {
      1: 10,
      2: 5,
      3: 1,
    },
    Dick: {
      3: 1,
      4: 5,
      5: 10,
    },
    Harry: {
      1: 1,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
    },
  },
  answerType: 'selectValue',
  possibleAnswers: ['Abhorrent', 'Not good', 'Ambivalent', 'Good', 'Delicious'],
};

export const ScaleRatingsPerFacilitator = Template.bind({});
ScaleRatingsPerFacilitator.args = {
  name: 'Scale ratings',
  question: 'How do you feel about deep dish?',
  perFacilitator: true,
  answers: {
    Tom: {
      1: 10,
      2: 5,
      3: 1,
    },
    Dick: {
      3: 1,
      4: 5,
      5: 10,
    },
    Harry: {
      1: 1,
      3: 1,
      5: 1,
    },
  },
  answerType: 'scale',
  possibleAnswers: ['1 - I hate it', '2', '3', '4', '5 - I love it'],
};
