import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import MatchAnswer from '@cdo/apps/quiz/attempt/match/MatchAnswer';
import {QuizQuestionResult} from '@cdo/apps/quiz/attempt/types';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 1,
  type: 'MatchQuestion',
  questionName: 'Sums',
  questionTitle: 'Match each expression to its value.',
  matchSets: [
    [
      {id: 'a', text: '1 + 1'},
      {id: 'b', text: '2 + 1'},
    ],
    [
      {id: 'x', text: '3'},
      {id: 'y', text: '2'},
    ],
  ],
  page: 1,
};

type MatchResult = Extract<QuizQuestionResult, {questionType: 'MatchQuestion'}>;

const renderAnswer = (
  resultOverrides: Partial<MatchResult> = {},
  isViewingStudent?: boolean
) =>
  render(
    <MatchAnswer
      question={QUESTION}
      result={{
        quizQuestionId: 1,
        questionType: 'MatchQuestion',
        responseData: {pairs: [['a', 'y']]},
        correct: null,
        explanation: null,
        ...resultOverrides,
      }}
      isViewingStudent={isViewingStudent}
    />
  );

const cardFor = (text: string) => screen.getByText(text).closest('div');

describe('MatchAnswer', () => {
  it('shows the pairs as read-only cards, not buttons', () => {
    renderAnswer();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.getByRole('group', {name: 'Your answer'})
    ).toBeInTheDocument();
  });

  it('states each card’s partner, or that it was left unmatched', () => {
    renderAnswer();

    expect(cardFor('1 + 1')).toHaveTextContent('1 + 1A, matched with 2');
    expect(cardFor('2')).toHaveTextContent('2A, matched with 1 + 1');
    expect(cardFor('2 + 1')).toHaveTextContent('2 + 1B, not matched');
    expect(cardFor('3')).toHaveTextContent('3, not matched');
  });

  it("labels the board as the student's answer for a teacher viewing it", () => {
    renderAnswer({}, true);

    expect(
      screen.getByRole('group', {name: "Student's answer"})
    ).toBeInTheDocument();
  });
});
