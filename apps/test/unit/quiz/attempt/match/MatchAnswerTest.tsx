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

// Each card's text as a screen reader reads it, without the aria-hidden dot:
// the start column, then the end column.
const spokenTexts = (boardName: string) =>
  within(screen.getByRole('group', {name: boardName}))
    .getAllByRole('listitem')
    .map(item => {
      const card = item.cloneNode(true) as Element;
      card.querySelectorAll('[aria-hidden="true"]').forEach(el => el.remove());
      return card.textContent;
    });

const CORRECT_PAIRS: [string, string][] = [
  ['a', 'y'],
  ['b', 'x'],
];

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

    expect(spokenTexts('Your answer')).toEqual([
      '1 + 1, matched with 2',
      '2 + 1, not matched',
      '3, not matched',
      '2, matched with 1 + 1',
    ]);
  });

  it("labels the board as the student's answer for a teacher viewing it", () => {
    renderAnswer({}, true);

    expect(
      screen.getByRole('group', {name: "Student's answer"})
    ).toBeInTheDocument();
  });

  it('marks each pair and shows the correct answer when the key is revealed', () => {
    renderAnswer({
      responseData: {pairs: [['b', 'y']]},
      correct: false,
      correctPairs: CORRECT_PAIRS,
    });

    expect(spokenTexts('Your answer')).toEqual([
      '1 + 1, not matched',
      '2 + 1, matched with 2, incorrect',
      '3, not matched',
      '2, matched with 2 + 1, incorrect',
    ]);
    // The board's name already says these pairs are correct.
    expect(spokenTexts('Correct answer')).toEqual([
      '1 + 1, matched with 2',
      '2 + 1, matched with 3',
      '3, matched with 2 + 1',
      '2, matched with 1 + 1',
    ]);
  });

  it('shows no correct answer for a correct response', () => {
    renderAnswer({
      responseData: {pairs: CORRECT_PAIRS},
      correct: true,
      correctPairs: CORRECT_PAIRS,
    });

    expect(spokenTexts('Your answer')).toContain(
      '1 + 1, matched with 2, correct'
    );
    expect(
      screen.queryByRole('group', {name: 'Correct answer'})
    ).not.toBeInTheDocument();
  });

  it('marks nothing when the key is hidden', () => {
    renderAnswer({correct: false, correctPairs: null});

    expect(spokenTexts('Your answer')[0]).toBe('1 + 1, matched with 2');
    expect(
      screen.queryByRole('group', {name: 'Correct answer'})
    ).not.toBeInTheDocument();
  });
});
