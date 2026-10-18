import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MultiChoiceQuestionContainer from '@cdo/apps/quiz/attempt/MultiChoiceQuestionContainer';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 5,
  type: 'MultipleChoiceQuestion',
  questionName: 'Variable reassignment',
  questionTitle: 'What is the value of x?',
  choices: [
    {id: 'a', text: '5'},
    {id: 'b', text: '8'},
  ],
  page: 1,
};

describe('MultiChoiceQuestionContainer', () => {
  it('renders the question title as an h2 title', () => {
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

  it('renders the description as markdown under the title', () => {
    render(
      <MultiChoiceQuestionContainer
        question={{...QUESTION, description: '### Hint\n\nAssume x is 5.'}}
        selectedChoiceId={null}
        onSelectChoice={jest.fn()}
      />
    );

    expect(
      screen.getByRole('heading', {name: 'Hint', level: 3})
    ).toBeInTheDocument();
    expect(screen.getByText('Assume x is 5.')).toBeInTheDocument();
  });

  it('renders only the title heading when there is no description', () => {
    render(
      <MultiChoiceQuestionContainer
        question={{...QUESTION, description: null}}
        selectedChoiceId={null}
        onSelectChoice={jest.fn()}
      />
    );

    expect(screen.getAllByRole('heading')).toHaveLength(1);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
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

  it('marks only the selected option with selectedChoiceStatus', () => {
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId="b"
        onSelectChoice={jest.fn()}
        selectedChoiceStatus="incorrect"
      />
    );

    expect(screen.getByRole('radio', {name: /8.*Incorrect/})).toBeChecked();
    expect(screen.getAllByText('Incorrect')).toHaveLength(1);
  });

  it('disables every option when disabled', () => {
    render(
      <MultiChoiceQuestionContainer
        question={QUESTION}
        selectedChoiceId="a"
        onSelectChoice={jest.fn()}
        disabled
      />
    );

    screen.getAllByRole('radio').forEach(radio => expect(radio).toBeDisabled());
  });
});
