import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MultipleSelectQuestionContainer from '@cdo/apps/quiz/attempt/choice/MultipleSelectQuestionContainer';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 5,
  type: 'MultipleSelectQuestion',
  questionName: 'Even numbers',
  questionTitle: 'Which are even?',
  choices: [
    {id: 'a', text: '2'},
    {id: 'b', text: '3'},
    {id: 'c', text: '4'},
  ],
  page: 1,
};

describe('MultipleSelectQuestionContainer', () => {
  it('groups one checkbox per choice under the question title', () => {
    render(
      <MultipleSelectQuestionContainer
        question={QUESTION}
        selectedChoiceIds={[]}
        onToggleChoice={jest.fn()}
      />
    );

    expect(
      screen.getByRole('group', {name: 'Which are even?'})
    ).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('checks every selected choice', () => {
    render(
      <MultipleSelectQuestionContainer
        question={QUESTION}
        selectedChoiceIds={['a', 'c']}
        onToggleChoice={jest.fn()}
      />
    );

    expect(screen.getByRole('checkbox', {name: /A\. 2/})).toBeChecked();
    expect(screen.getByRole('checkbox', {name: /B\. 3/})).not.toBeChecked();
    expect(screen.getByRole('checkbox', {name: /C\. 4/})).toBeChecked();
  });

  it('reports the toggled choice', () => {
    const onToggleChoice = jest.fn();
    render(
      <MultipleSelectQuestionContainer
        question={QUESTION}
        selectedChoiceIds={['a']}
        onToggleChoice={onToggleChoice}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', {name: /A\. 2/}));
    fireEvent.click(screen.getByRole('checkbox', {name: /C\. 4/}));

    expect(onToggleChoice.mock.calls).toEqual([['a'], ['c']]);
  });

  it('disables every checkbox when disabled', () => {
    render(
      <MultipleSelectQuestionContainer
        question={QUESTION}
        selectedChoiceIds={[]}
        onToggleChoice={jest.fn()}
        disabled
      />
    );

    screen
      .getAllByRole('checkbox')
      .forEach(checkbox => expect(checkbox).toBeDisabled());
  });
});
