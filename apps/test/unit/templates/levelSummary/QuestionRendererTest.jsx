import {render, screen} from '@testing-library/react';
import React from 'react';

import QuestionRenderer from '@cdo/apps/templates/levelSummary/QuestionRenderer';

const MULTI_LEVEL_JS_DATA = {
  properties: {
    questions: [{text: 'What is 2 + 2?'}],
    answers: [{text: 'A. 3'}, {text: 'B. 4'}, {text: 'C. 5'}],
  },
  height: 100,
  type: 'Multi',
  id: 1,
  name: 'Multiple Choice Question',
};
const FREE_RESPONSE_JS_DATA = {
  properties: {
    long_instructions: 'Please explain the process of photosynthesis.',
  },
  height: 80,
  type: 'FreeResponse',
  id: 2,
  name: 'Photosynthesis Explanation',
};

const renderDefault = (levelData = MULTI_LEVEL_JS_DATA) => {
  render(<QuestionRenderer levelData={levelData} />);
};

describe('QuestionRenderer', () => {
  it('renders a multi level', () => {
    renderDefault();

    screen.getByText('What is 2 + 2?');
    screen.getByText('A. 3');
    screen.getByText('B. 4');
    screen.getByText('C. 5');
  });

  it('renders a free response level', () => {
    renderDefault(FREE_RESPONSE_JS_DATA);

    screen.getByText('Please explain the process of photosynthesis.');
  });
});
