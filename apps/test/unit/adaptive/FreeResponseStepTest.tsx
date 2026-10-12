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
  updateStepContext = jest.fn()
) {
  return {
    pathway: {} as never,
    checkpoint: {} as never,
    statusMap: {},
    stepContextMap,
    updateStepContext,
    aiContext: {} as never,
  };
}

function renderStep(
  stepContextMap: {[stepId: string]: StepContext} = {},
  continueLabel = 'Continue'
) {
  const onComplete = jest.fn();
  const updateStepContext = jest.fn();

  // Mirror how PathwayApp propagates updateStepContext so tests can verify
  // the call without needing full progress store wiring.
  render(
    <PathwayContext.Provider
      value={makeContext(stepContextMap, updateStepContext)}
    >
      <FreeResponseStep
        step={step}
        continueLabel={continueLabel}
        onComplete={onComplete}
      />
    </PathwayContext.Provider>
  );

  return {onComplete, updateStepContext};
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

  it('calls updateStepContext then onComplete on submit', () => {
    const {onComplete, updateStepContext} = renderStep();
    fireEvent.change(screen.getByRole('textbox'), {
      target: {value: 'I learned a lot.'},
    });
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(updateStepContext).toHaveBeenCalledWith('reflect', {
      freeResponse: 'I learned a lot.',
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not call onComplete without any text', () => {
    const {onComplete} = renderStep();
    fireEvent.click(screen.getByRole('button', {name: /Continue/}));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('restores a saved response from stepContextMap', () => {
    renderStep({reflect: {freeResponse: 'Previous answer.'}});
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
