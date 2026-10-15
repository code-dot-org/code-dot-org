import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import FreeResponseQuestionContainer from '@cdo/apps/quiz/attempt/FreeResponseQuestionContainer';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 9,
  type: 'FreeResponseQuestion',
  questionName: 'Loop',
  questionTitle: 'Why does the loop stop?',
  page: 1,
};

describe('FreeResponseQuestionContainer', () => {
  it('shows the given answer text in a textbox named by the question', () => {
    render(
      <FreeResponseQuestionContainer
        question={QUESTION}
        answerText="x > 3"
        onChangeAnswerText={jest.fn()}
      />
    );

    expect(
      screen.getByRole('textbox', {name: 'Why does the loop stop?'})
    ).toHaveValue('x > 3');
  });

  it('reports each edit and blur', () => {
    const onChangeAnswerText = jest.fn();
    const onBlur = jest.fn();
    render(
      <FreeResponseQuestionContainer
        question={QUESTION}
        answerText=""
        onChangeAnswerText={onChangeAnswerText}
        onBlur={onBlur}
      />
    );
    const textbox = screen.getByRole('textbox');

    fireEvent.change(textbox, {target: {value: 'x'}});
    fireEvent.blur(textbox);

    expect(onChangeAnswerText).toHaveBeenCalledWith('x');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('disables the textbox when disabled', () => {
    render(
      <FreeResponseQuestionContainer
        question={QUESTION}
        answerText="x > 3"
        onChangeAnswerText={jest.fn()}
        disabled
      />
    );

    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
