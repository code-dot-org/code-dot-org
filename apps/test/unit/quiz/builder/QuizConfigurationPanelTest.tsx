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

// No time limit by default.
const INITIAL_VALUES: QuizConfigurationData = {
  showCorrectness: true,
  revealAnswerExplanation: false,
  showIntroScreen: true,
  purpose: 'practice',
  allowMultipleAttempts: true,
};

// The time-limit field's label wraps the helper-message text too, so its
// whole label text is "Set time limitLeave unset for no time limit" - a
// regex substring match avoids depending on that formatting.
const TIME_LIMIT_LABEL = /Set time limit/;

function jsonResponse(data: QuizConfigurationData): Response {
  return {ok: true, json: async () => data} as Response;
}

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

function lastRequestBody() {
  return JSON.parse(put.mock.calls[put.mock.calls.length - 1][1] as string);
}

describe('QuizConfigurationPanel', () => {
  beforeEach(() => {
    put.mockReset();
  });

  it('shows the chooser when no purpose is set yet, and saves the chosen purpose', async () => {
    put.mockResolvedValue(jsonResponse({...INITIAL_VALUES, purpose: 'exam'}));
    const {onSaved} = renderPanel({
      initialValues: {...INITIAL_VALUES, purpose: undefined},
    });
    expect(screen.getByText('What is this quiz for?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Exam', {exact: true}));

    // Switches to the dropdown right away, without waiting on the save.
    expect(
      screen.queryByText('What is this quiz for?')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('Purpose')).toHaveValue('exam');
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(lastRequestBody().purpose).toBe('exam');
  });

  it('reverts to the chooser when saving the chosen purpose fails', async () => {
    put.mockRejectedValue(new Error('network down'));
    renderPanel({initialValues: {...INITIAL_VALUES, purpose: undefined}});

    fireEvent.click(screen.getByText('Exam', {exact: true}));
    expect(screen.getByLabelText('Purpose')).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText('What is this quiz for?')).toBeInTheDocument()
    );
  });

  it('saves a purpose changed from the dropdown, reverting on failure', async () => {
    put.mockRejectedValue(new Error('network down'));
    renderPanel();

    fireEvent.change(screen.getByLabelText('Purpose'), {
      target: {value: 'exam'},
    });
    expect(screen.getByLabelText('Purpose')).toHaveValue('exam');

    await waitFor(() =>
      expect(screen.getByLabelText('Purpose')).toHaveValue('practice')
    );
  });

  it('saves a toggle change immediately with just that field overridden', async () => {
    put.mockResolvedValue(jsonResponse(INITIAL_VALUES));
    const {onSaved} = renderPanel();

    fireEvent.click(screen.getByLabelText('Show intro screen'));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(lastRequestBody()).toEqual({
      timeLimitMinutes: null,
      showCorrectness: true,
      revealAnswerExplanation: false,
      showIntroScreen: false,
      purpose: 'practice',
      allowMultipleAttempts: true,
    });
  });

  it('reverts a toggle when its save is rejected by the server', async () => {
    put.mockRejectedValue(new Error('network down'));
    renderPanel();

    const toggle = screen.getByLabelText(
      'Allow multiple attempts'
    ) as HTMLInputElement;
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);

    await waitFor(() =>
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    );
    expect(toggle.checked).toBe(true);
  });

  it('disables controls while a save is in flight', async () => {
    let resolvePut: (response: Response) => void = () => {};
    put.mockReturnValue(
      new Promise(resolve => {
        resolvePut = resolve;
      })
    );
    renderPanel();

    const toggle = screen.getByLabelText(
      'Show intro screen'
    ) as HTMLInputElement;
    fireEvent.click(toggle);
    expect(toggle).toBeDisabled();

    resolvePut(jsonResponse(INITIAL_VALUES));
    await waitFor(() => expect(toggle).not.toBeDisabled());
  });

  it('saves the time limit on blur, not on every keystroke', () => {
    renderPanel();
    const field = screen.getByLabelText(TIME_LIMIT_LABEL);

    fireEvent.change(field, {target: {value: '2'}});
    expect(put).not.toHaveBeenCalled();

    fireEvent.blur(field);
    expect(put).toHaveBeenCalledTimes(1);
  });

  it('sends a blank time limit as null', async () => {
    put.mockResolvedValue(jsonResponse(INITIAL_VALUES));
    renderPanel({
      initialValues: {...INITIAL_VALUES, timeLimitMinutes: 10},
    });
    const field = screen.getByLabelText(TIME_LIMIT_LABEL);

    fireEvent.change(field, {target: {value: ''}});
    fireEvent.blur(field);

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastRequestBody().timeLimitMinutes).toBe(null);
  });

  it('does not save when the time limit is not a positive integer', async () => {
    renderPanel();
    const field = screen.getByLabelText(TIME_LIMIT_LABEL);

    fireEvent.change(field, {target: {value: '0'}});
    fireEvent.blur(field);

    expect(
      await screen.findByText(
        'Time limit must be a whole number of minutes greater than 0, or left blank for no limit.'
      )
    ).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
  });

  it('does not save, and reverts, when turning off show intro screen while a time limit is set', async () => {
    renderPanel({
      initialValues: {...INITIAL_VALUES, timeLimitMinutes: 10},
    });

    const toggle = screen.getByLabelText(
      'Show intro screen'
    ) as HTMLInputElement;
    fireEvent.click(toggle);

    expect(
      await screen.findByText(
        'Show intro screen is required when a time limit is set.'
      )
    ).toBeInTheDocument();
    expect(put).not.toHaveBeenCalled();
    expect(toggle.checked).toBe(true);
  });

  it('turning off show correctness also clears reveal answer/explanation in the same request', async () => {
    put.mockResolvedValue(jsonResponse(INITIAL_VALUES));
    renderPanel({
      initialValues: {...INITIAL_VALUES, revealAnswerExplanation: true},
    });

    fireEvent.click(screen.getByLabelText('Show correctness'));

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastRequestBody()).toMatchObject({
      showCorrectness: false,
      revealAnswerExplanation: false,
    });
    expect(
      screen.queryByLabelText('Reveal answer and explanation')
    ).not.toBeInTheDocument();
  });

  it('reverts both show correctness and reveal answer/explanation together on failure', async () => {
    put.mockRejectedValue(
      new NetworkError(
        '400 Bad Request',
        new Response(JSON.stringify({error: 'nope'}), {
          status: 400,
          headers: {'Content-Type': 'application/json'},
        })
      )
    );
    renderPanel({
      initialValues: {...INITIAL_VALUES, revealAnswerExplanation: true},
    });

    fireEvent.click(screen.getByLabelText('Show correctness'));

    expect(await screen.findByText('nope')).toBeInTheDocument();
    expect(
      (screen.getByLabelText('Show correctness') as HTMLInputElement).checked
    ).toBe(true);
    expect(
      (
        screen.getByLabelText(
          'Reveal answer and explanation'
        ) as HTMLInputElement
      ).checked
    ).toBe(true);
  });

  it('saves reveal answer/explanation independently once shown', async () => {
    put.mockResolvedValue(jsonResponse(INITIAL_VALUES));
    renderPanel();

    fireEvent.click(screen.getByLabelText('Reveal answer and explanation'));

    await waitFor(() => expect(put).toHaveBeenCalled());
    expect(lastRequestBody().revealAnswerExplanation).toBe(true);
  });
});
