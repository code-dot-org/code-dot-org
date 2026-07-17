import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import QuizLabView from '@cdo/apps/quiz/QuizLabView';
import {QuizLevelProperties} from '@cdo/apps/quiz/types';
import HttpClient from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  post: jest.fn().mockResolvedValue({}),
}));

const levelProperties: QuizLevelProperties = {
  id: 42,
  name: 'quiz_test_level',
  appName: 'quiz',
  scriptId: 7,
  surveyJson: {
    pages: [
      {
        elements: [
          {
            type: 'radiogroup',
            name: 'q_1',
            title: 'What number will be output?',
            choices: [
              {value: 'A', text: '10'},
              {value: 'B', text: '100'},
            ],
            correctAnswer: 'B',
          },
        ],
      },
    ],
  },
};

describe('QuizLabView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the question from surveyJson', () => {
    render(<QuizLabView levelProperties={levelProperties} />);

    expect(screen.getByText('What number will be output?')).toBeInTheDocument();
  });

  it('submits the survey response to /levels/:id/quiz_responses', async () => {
    render(<QuizLabView levelProperties={levelProperties} />);

    await userEvent.click(screen.getByRole('radio', {name: '100'}));
    await userEvent.click(screen.getByRole('button', {name: /complete/i}));

    await waitFor(() => expect(HttpClient.post).toHaveBeenCalledTimes(1));

    const [endpoint, body] = (HttpClient.post as jest.Mock).mock.calls[0];
    expect(endpoint).toBe('/levels/42/quiz_responses');
    expect(JSON.parse(body)).toEqual({
      response_data: {q_1: 'B'},
      script_id: 7,
    });
  });
});
