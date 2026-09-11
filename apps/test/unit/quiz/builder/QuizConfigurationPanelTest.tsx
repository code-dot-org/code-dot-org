import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizConfigurationPanel, {
  QuizConfigurationData,
} from '@cdo/apps/quiz/builder/QuizConfigurationPanel';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  ...jest.requireActual('@cdo/apps/util/HttpClient'),
  default: {
    ...jest.requireActual('@cdo/apps/util/HttpClient').default,
    put: jest.fn(),
  },
}));

const put = HttpClient.put as jest.MockedFunction<typeof HttpClient.put>;

const INITIAL_VALUES: QuizConfigurationData = {
  displayName: 'Unit quiz',
  customIntroText: 'Read the instructions.',
  timeLimitMinutes: 10,
  showCorrectness: true,
  revealAnswerExplanation: false,
  showIntroScreen: true,
  purpose: 'practice',
  allowMultipleAttempts: true,
};

const SAVED: QuizConfigurationData = {
  ...INITIAL_VALUES,
  displayName: 'Saved title',
};

function renderPanel(
  overrides: Partial<React.ComponentProps<typeof QuizConfigurationPanel>> = {}
) {
  const onSaved = jest.fn();
  render(
    <QuizConfigurationPanel
      quizId={42}
      initialValues={INITIAL_VALUES}
      onSaved={onSaved}
      {...overrides}
    />
  );
  return {onSaved};
}

function clickSave() {
  fireEvent.click(screen.getByRole('button', {name: 'Save'}));
}

describe('QuizConfigurationPanel', () => {
  beforeEach(() => {
    put.mockReset();
  });

  it('puts the edited configuration and calls onSaved with the server payload', async () => {
    put.mockResolvedValue({
      ok: true,
      json: async () => SAVED,
    } as Response);
    const {onSaved} = renderPanel();

    fireEvent.change(screen.getByLabelText('Quiz title (optional)'), {
      target: {value: 'Midterm'},
    });
    clickSave();

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(SAVED));
    expect(put).toHaveBeenCalledWith(
      '/levels/42/quiz_configuration',
      JSON.stringify({
        displayName: 'Midterm',
        customIntroText: 'Read the instructions.',
        timeLimitMinutes: 10,
        showCorrectness: true,
        revealAnswerExplanation: false,
        showIntroScreen: true,
        purpose: 'practice',
        allowMultipleAttempts: true,
      }),
      true,
      {'Content-Type': 'application/json'}
    );
    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
  });

  it('sends a blank time limit as null', async () => {
    put.mockResolvedValue({
      ok: true,
      json: async () => SAVED,
    } as Response);
    renderPanel({
      initialValues: {...INITIAL_VALUES, timeLimitMinutes: undefined},
    });

    clickSave();

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(JSON.parse(put.mock.calls[0][1] as string).timeLimitMinutes).toBe(
      null
    );
  });

  it('does not put when the time limit is not a positive integer', async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText('Time limit (minutes, optional)'), {
      target: {value: '0'},
    });
    clickSave();

    expect(
      await screen.findByText(
        'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.'
      )
    ).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
  });

  it('does not put when a time limit is set without the intro screen', async () => {
    renderPanel({
      initialValues: {...INITIAL_VALUES, showIntroScreen: false},
    });

    clickSave();

    expect(
      await screen.findByText(
        'Show intro screen is required when a time limit is set.'
      )
    ).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
  });

  it('shows the server error when put rejects and re-enables Save', async () => {
    put.mockRejectedValue(
      new NetworkError(
        '400 Bad Request',
        new Response(
          JSON.stringify({
            error: 'cannot be true unless show_correctness is also true',
          }),
          {
            status: 400,
            headers: {'Content-Type': 'application/json'},
          }
        )
      )
    );
    const {onSaved} = renderPanel();

    clickSave();

    expect(
      await screen.findByText(
        'cannot be true unless show_correctness is also true'
      )
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Save'})).toBeEnabled();
  });

  it('shows a fallback message when put rejects without a JSON error', async () => {
    put.mockRejectedValue(new Error('network down'));
    renderPanel();

    clickSave();

    expect(
      await screen.findByText('Something went wrong.')
    ).toBeInTheDocument();
  });
});
