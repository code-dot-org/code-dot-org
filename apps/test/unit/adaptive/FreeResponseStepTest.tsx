import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {StepContext} from '@cdo/apps/adaptive/progress/model';
import {FreeResponseStep as Step} from '@cdo/apps/adaptive/types';
import {PathwayContext} from '@cdo/apps/adaptive/views/PathwayContext';
import FreeResponseStep from '@cdo/apps/adaptive/views/steps/FreeResponseStep';

const step: Step = {
  id: 'reflect',
  title: 'Reflection',
  kind: 'freeResponse',
  prompt: 'What did you learn today?',
  placeholder: 'Type your answer...',
};

// Minimal context: only the fields FreeResponseStep reads.
function makeContext(
  stepContextMap: {[stepId: string]: StepContext} = {},
  saveAnswers = jest.fn()
) {
  return {
    pathway: {} as never,
    checkpoint: {} as never,
    statusMap: {},
    stepContextMap,
    updateStepContext: jest.fn(),
    saveAnswers,
    aiContext: {} as never,
  };
}

function renderStep(
  stepContextMap: {[stepId: string]: StepContext} = {},
  continueLabel = 'Continue'
) {
  const onComplete = jest.fn();
  const saveAnswers = jest.fn();

  render(
    <PathwayContext.Provider value={makeContext(stepContextMap, saveAnswers)}>
      <FreeResponseStep
        step={step}
        continueLabel={continueLabel}
        onComplete={onComplete}
      />
    </PathwayContext.Provider>
  );

  return {onComplete, saveAnswers};
}

describe('FreeResponseStep', () => {
  it('shows the title and prompt', () => {
    renderStep();
    expect(screen.getByText('Reflection')).toBeInTheDocument();
    expect(screen.getByText('What did you learn today?')).toBeInTheDocument();
  });

  it('renders a textarea with the configured placeholder', () => {
    renderStep();
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'Type your answer...'
    );
  });

  it('disables the button when the textarea is empty', () => {
    renderStep();
    expect(screen.getByRole('button', {name: /Continue/})).toBeDisabled();
  });

  it('enables the button once the student types something', () => {
    renderStep();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'I learned a lot.'},
    });
    expect(screen.getByRole('button', {name: /Continue/})).toBeEnabled();
  });

  it('keeps the button disabled for whitespace-only input', () => {
    renderStep();
    fireEvent.change(screen.getByRole('textbox'), {target: {value: '   '}});
    expect(screen.getByRole('button', {name: /Continue/})).toBeDisabled();
  });

  it('calls saveAnswers then onComplete on submit', () => {
    const {onComplete, saveAnswers} = renderStep();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'I learned a lot.'},
    });
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(saveAnswers).toHaveBeenCalledWith('reflect', 0, [
      {answerId: '', text: 'I learned a lot.'},
    ]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete without any text', () => {
    const {onComplete} = renderStep();
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(onComplete).not.toHaveBeenCalled();
  });

  describe('draft auto-save', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('saves the draft 500 ms after typing stops', () => {
      const {saveAnswers} = renderStep();
      fireEvent.change(screen.getByRole('textbox'), {
        target: {value: 'Draft text.'},
      });
      expect(saveAnswers).not.toHaveBeenCalled();
      jest.advanceTimersByTime(500);
      expect(saveAnswers).toHaveBeenCalledWith('reflect', 0, [
        {answerId: '', text: 'Draft text.'},
      ]);
    });

    it('resets the timer on each keystroke', () => {
      const {saveAnswers} = renderStep();
      fireEvent.change(screen.getByRole('textbox'), {target: {value: 'A'}});
      jest.advanceTimersByTime(400);
      fireEvent.change(screen.getByRole('textbox'), {target: {value: 'AB'}});
      jest.advanceTimersByTime(400);
      expect(saveAnswers).not.toHaveBeenCalled();
      jest.advanceTimersByTime(100);
      expect(saveAnswers).toHaveBeenCalledTimes(1);
      expect(saveAnswers).toHaveBeenCalledWith('reflect', 0, [
        {answerId: '', text: 'AB'},
      ]);
    });

    it('does not auto-save when text matches the restored value', () => {
      const {saveAnswers} = renderStep({
        reflect: {answers: {0: [{answerId: '', text: 'Previous answer.'}]}},
      });
      jest.advanceTimersByTime(1000);
      expect(saveAnswers).not.toHaveBeenCalled();
    });

    it('flushes the draft immediately on submit without waiting for the timer', () => {
      const {saveAnswers, onComplete} = renderStep();
      fireEvent.change(screen.getByRole('textbox'), {
        target: {value: 'Draft text.'},
      });
      // Submit before the 500 ms debounce fires.
      fireEvent.click(screen.getByRole('button', {name: /Continue/}));
      expect(saveAnswers).toHaveBeenCalledWith('reflect', 0, [
        {answerId: '', text: 'Draft text.'},
      ]);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it('disables the button immediately after submit', () => {
    renderStep();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'My answer.'},
    });
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(screen.getByRole('button', {name: /Continue/})).toBeDisabled();
  });

  it('restores a saved response from stepContextMap', () => {
    renderStep({
      reflect: {answers: {0: [{answerId: '', text: 'Previous answer.'}]}},
    });
    expect(screen.getByRole('textbox')).toHaveValue('Previous answer.');
    expect(screen.getByRole('button', {name: /Continue/})).toBeEnabled();
  });

  it('renders the continueLabel on the submit button', () => {
    renderStep({}, 'Complete checkpoint');
    expect(
      screen.getByRole('button', {name: /Complete checkpoint/})
    ).toBeInTheDocument();
  });
});
