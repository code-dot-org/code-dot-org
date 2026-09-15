import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizQuestionCard from '@cdo/apps/quiz/builder/QuizQuestionCard';
import {QuizBuilderQuestion} from '@cdo/apps/quiz/builder/types';

const QUESTION: QuizBuilderQuestion = {
  id: 7,
  type: 'MultipleChoiceQuestion',
  questionName: 'Existing question',
  stem: 'What is 2 + 2?',
  choices: [
    {id: 'a', text: '3'},
    {id: 'b', text: '4'},
  ],
  correctChoiceId: 'b',
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  usedInPublishedUnit: false,
  page: 1,
};

function renderCard(
  props: Partial<React.ComponentProps<typeof QuizQuestionCard>> = {}
) {
  const onUpdate = jest.fn().mockResolvedValue(true);
  const onRemove = jest.fn().mockResolvedValue(true);
  const utils = render(
    <QuizQuestionCard
      question={QUESTION}
      onUpdate={onUpdate}
      onRemove={onRemove}
      {...props}
    />
  );
  return {...utils, onUpdate, onRemove};
}

describe('QuizQuestionCard', () => {
  it('shows a collapsed preview by default', () => {
    renderCard();

    expect(screen.getByText('Existing question')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.queryByRole('tab', {name: 'Question'})).toBeNull();
  });

  it('expands into the editor when the edit button is clicked', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));

    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
    expect(screen.getByLabelText('Internal name')).toHaveValue(
      'Existing question'
    );
  });

  it('starts expanded when startExpanded is set', () => {
    renderCard({startExpanded: true});

    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
  });

  it('saves the edited draft and collapses on success', async () => {
    const {onUpdate} = renderCard({startExpanded: true});

    fireEvent.change(screen.getByLabelText('Internal name'), {
      target: {value: 'Renamed question'},
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Save'}));
    });

    expect(onUpdate).toHaveBeenCalledWith(
      7,
      expect.objectContaining({questionName: 'Renamed question'})
    );
  });

  it('discards edits back to the saved question', () => {
    renderCard({startExpanded: true});

    const nameField = screen.getByLabelText('Internal name');
    fireEvent.change(nameField, {target: {value: 'Something else'}});
    fireEvent.click(screen.getByRole('button', {name: 'Discard changes'}));

    expect(nameField).toHaveValue('Existing question');
  });

  it('confirms before removing the question from the quiz', async () => {
    const {onRemove} = renderCard({startExpanded: true});

    fireEvent.click(screen.getByRole('button', {name: 'Remove from quiz'}));
    expect(onRemove).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Remove'}));
    });
    expect(onRemove).toHaveBeenCalledWith(7);
  });
});
