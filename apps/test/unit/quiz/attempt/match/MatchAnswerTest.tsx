import {render, screen, within} from '@testing-library/react';
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

// A card's text as a screen reader reads it, without the aria-hidden dot.
const spokenTextFor = (text: string) => {
  const card = screen
    .getAllByRole('listitem')
    .find(item => within(item).queryByText(text))!
    .cloneNode(true) as Element;
  card.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
  return card.textContent;
};

describe('MatchAnswer', () => {
  it('shows the pairs as two lists of read-only cards, not buttons', () => {
    renderAnswer();

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getAllByRole('list')).toHaveLength(2);
    expect(
      screen.getByRole('group', {name: 'Your answer'})
    ).toBeInTheDocument();
  });

  it('states each card’s partner, or that it was left unmatched', () => {
    renderAnswer();

    expect(spokenTextFor('1 + 1')).toBe('1 + 1, matched with 2');
    expect(spokenTextFor('2')).toBe('2, matched with 1 + 1');
    expect(spokenTextFor('2 + 1')).toBe('2 + 1, not matched');
    expect(spokenTextFor('3')).toBe('3, not matched');
  });

  it("labels the board as the student's answer for a teacher viewing it", () => {
    renderAnswer({}, true);

    expect(
      screen.getByRole('group', {name: "Student's answer"})
    ).toBeInTheDocument();
  });
});
