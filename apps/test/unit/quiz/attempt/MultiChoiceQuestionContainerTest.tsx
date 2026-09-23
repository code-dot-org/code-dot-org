import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 5,
  type: 'MultipleChoiceQuestion',
  questionName: 'Variable reassignment',
  stem: 'What is the value of x?',
  choices: [
    {id: 'a', text: '5'},
    {id: 'b', text: '8'},
  ],
  page: 1,
};

describe('MultiChoiceQuestionContainer', () => {
  it("renders the question's stem as an h2 title", () => {
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId={null}
        onSelectChoice={jest.fn()}
      />
    );

    // Level matters here, not just presence - AttemptCard keeps the h4
    // visual size but must render as an actual <h2> to avoid skipping
    // heading levels for assistive technology.
    expect(
      screen.getByRole('heading', {
        name: 'What is the value of x?',
        level: 2,
      })
    ).toBeInTheDocument();
  });

  it('renders one radio option per choice, lettered in order', () => {
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId={null}
        onSelectChoice={jest.fn()}
      />
    );

    expect(screen.getByRole('radio', {name: /A\..*5/})).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: /B\..*8/})).toBeInTheDocument();
  });

  it('checks the option matching selectedChoiceId', () => {
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId="b"
        onSelectChoice={jest.fn()}
      />
    );

    expect(screen.getByRole('radio', {name: /A\./})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: /B\./})).toBeChecked();
  });

  it('calls onSelectChoice with the clicked choice id', () => {
    const onSelectChoice = jest.fn();
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId={null}
        onSelectChoice={onSelectChoice}
      />
    );

    fireEvent.click(screen.getByRole('radio', {name: /B\./}));

    expect(onSelectChoice).toHaveBeenCalledWith('b');
  });
});
