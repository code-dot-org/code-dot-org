import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {AnswerRecord} from '@cdo/apps/adaptive/progress';
import {MultipleChoiceQuestion as Question} from '@cdo/apps/adaptive/types';
import MultipleChoiceQuestion from '@cdo/apps/adaptive/views/steps/MultipleChoiceQuestion';

const single: Question = {
  id: 'q1',
  type: 'multipleChoice',
  text: 'Pick one',
  options: [
    {id: 'a', label: 'Alpha', correct: true},
    {id: 'b', label: 'Beta'},
    {id: 'c', label: 'Gamma'},
  ],
};

const multi: Question = {
  ...single,
  id: 'q2',
  text: 'Pick all',
  multiSelect: true,
};

const passedRecord: AnswerRecord = {
  questionId: 'q1',
  stepId: 'quiz',
  prompt: 'Pick one',
  answer: 'Alpha',
  optionId: 'a',
  outcome: 'correct',
  attempts: 1,
  at: '2026-09-30T00:00:00.000Z',
};

function renderQuestion(
  props: Partial<React.ComponentProps<typeof MultipleChoiceQuestion>> = {}
) {
  const onSubmit = jest.fn();
  render(
    <MultipleChoiceQuestion
      question={single}
      record={undefined}
      feedback={undefined}
      locked={false}
      isLast={false}
      shakeNonce={0}
      focusOnMount={false}
      onSelectionChange={jest.fn()}
      onSubmit={onSubmit}
      {...props}
    />
  );
  return {onSubmit};
}

describe('MultipleChoiceQuestion', () => {
  it('groups single-select options as radios under the question text', () => {
    renderQuestion();
    expect(screen.getByRole('group', {name: 'Pick one'})).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('keeps one choice on single select', () => {
    const {onSubmit} = renderQuestion();
    fireEvent.click(screen.getByLabelText('Alpha'));
    fireEvent.click(screen.getByLabelText('Beta'));
    expect(screen.getByLabelText('Alpha')).not.toBeChecked();
    expect(screen.getByLabelText('Beta')).toBeChecked();
    fireEvent.click(screen.getByRole('button', {name: 'Next →'}));
    expect(onSubmit).toHaveBeenCalledWith(['b']);
  });

  it('toggles checkboxes on multi select', () => {
    const {onSubmit} = renderQuestion({question: multi});
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    fireEvent.click(screen.getByLabelText('Alpha'));
    fireEvent.click(screen.getByLabelText('Gamma'));
    fireEvent.click(screen.getByLabelText('Alpha'));
    fireEvent.click(screen.getByRole('button', {name: 'Next →'}));
    expect(onSubmit).toHaveBeenCalledWith(['c']);
  });

  it('disables submit until something is selected, and reads Finish last', () => {
    renderQuestion({isLast: true});
    const submit = screen.getByRole('button', {name: 'Finish →'});
    expect(submit).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Beta'));
    expect(submit).toBeEnabled();
  });

  it('reports a changed selection so feedback can clear', () => {
    const onSelectionChange = jest.fn();
    renderQuestion({feedback: 'incorrect', onSelectionChange});
    fireEvent.click(screen.getByLabelText('Gamma'));
    expect(onSelectionChange).toHaveBeenCalled();
  });

  it('reopens a passed question read-only with its answer', () => {
    const {onSubmit} = renderQuestion({record: passedRecord});
    expect(screen.getByLabelText('Alpha')).toBeChecked();
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
    expect(screen.getByText('Answered correctly')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Next →'}));
    expect(onSubmit).toHaveBeenCalledWith(['a']);
  });

  it('prefills an unpassed question from its last answer', () => {
    renderQuestion({
      record: {
        ...passedRecord,
        answer: 'Beta',
        optionId: 'b',
        outcome: 'incorrect',
      },
    });
    expect(screen.getByLabelText('Beta')).toBeChecked();
    expect(screen.getByLabelText('Beta')).toBeEnabled();
    expect(screen.queryByText('Answered correctly')).not.toBeInTheDocument();
  });

  it('keeps a locked submit button focusable but inert', () => {
    const {onSubmit} = renderQuestion({locked: true, record: passedRecord});
    const submit = screen.getByRole('button', {name: 'Next →'});
    expect(submit).toBeEnabled();
    expect(submit).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(submit);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('moves focus to the question text only when asked', () => {
    renderQuestion({focusOnMount: true});
    expect(screen.getByText('Pick one')).toHaveFocus();
  });
});
