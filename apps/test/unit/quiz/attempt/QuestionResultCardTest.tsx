import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuestionResultCard, {
  QuestionResultCardProps,
} from '@cdo/apps/quiz/attempt/QuestionResultCard';
import {QuizQuestionResult} from '@cdo/apps/quiz/attempt/types';
import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

const QUESTION: QuizQuestionSummary = {
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'Addition',
  questionTitle: 'What is 2 + 2?',
  choices: [
    {id: '0', text: 'Three'},
    {id: '1', text: 'Four'},
    {id: '2', text: 'Five'},
  ],
  page: 1,
};

type MultipleChoiceResult = Extract<
  QuizQuestionResult,
  {questionType: 'MultipleChoiceQuestion'}
>;

const BASE_RESULT: MultipleChoiceResult = {
  quizQuestionId: 1,
  questionType: 'MultipleChoiceQuestion',
  responseData: {},
  correct: null,
  explanation: null,
  correctChoiceId: null,
};

const renderCard = (
  resultOverrides: Partial<MultipleChoiceResult> = {},
  props: Partial<QuestionResultCardProps> = {}
) =>
  render(
    <QuestionResultCard
      question={QUESTION}
      result={{...BASE_RESULT, ...resultOverrides}}
      {...props}
    />
  );

// Choice text shares a text node with the "A." letter prefix, so no element's
// full text content is the choice text alone - a regex matches the substring.
const choiceItem = (text: string) =>
  screen.getByText(new RegExp(text)).closest('li') as HTMLElement;

describe('QuestionResultCard', () => {
  it('marks the selected correct choice', () => {
    renderCard({responseData: {selectedChoiceId: '1'}, correct: true});

    expect(
      within(choiceItem('Four')).getByText('Correct answer')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Your answer', {exact: true})
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Your answer, incorrect')
    ).not.toBeInTheDocument();
  });

  it('marks the selected incorrect choice', () => {
    renderCard({responseData: {selectedChoiceId: '2'}, correct: false});

    expect(
      within(choiceItem('Five')).getByText('Your answer, incorrect')
    ).toBeInTheDocument();
    // No correctChoiceId given, so nothing is revealed as correct.
    expect(screen.queryByText('Correct answer')).not.toBeInTheDocument();
  });

  it('shows a selected choice as ungraded when correctness is hidden', () => {
    renderCard({responseData: {selectedChoiceId: '0'}, correct: null});

    expect(
      within(choiceItem('Three')).getByText('Your answer', {exact: true})
    ).toBeInTheDocument();
    expect(screen.queryByText('Correct answer')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Your answer, incorrect')
    ).not.toBeInTheDocument();
  });

  it("labels the selection as the student's answer for a teacher viewing a student", () => {
    renderCard(
      {
        responseData: {selectedChoiceId: '2'},
        correct: false,
        correctChoiceId: '1',
      },
      {isViewingStudent: true}
    );
    expect(
      within(choiceItem('Five')).getByText("Student's answer, incorrect")
    ).toBeInTheDocument();
    expect(screen.queryByText(/Your answer/)).not.toBeInTheDocument();
  });

  it("labels an ungraded selection as the student's answer for a teacher viewing a student", () => {
    renderCard(
      {responseData: {selectedChoiceId: '0'}},
      {isViewingStudent: true}
    );
    expect(
      within(choiceItem('Three')).getByText("Student's answer", {exact: true})
    ).toBeInTheDocument();
  });

  it('marks no choice as selected when the question was skipped', () => {
    renderCard();

    expect(
      screen.queryByText('Your answer', {exact: true})
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Your answer, incorrect')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Correct answer')).not.toBeInTheDocument();
  });

  it('reveals the correct choice even when the question was skipped', () => {
    renderCard({correct: false, correctChoiceId: '1'});

    expect(
      within(choiceItem('Four')).getByText('Correct answer')
    ).toBeInTheDocument();
    // Revealed, not picked - nothing was actually selected.
    expect(
      screen.queryByText('Your answer', {exact: true})
    ).not.toBeInTheDocument();
  });

  it('renders the question description as markdown', () => {
    renderCard(
      {},
      {question: {...QUESTION, description: 'Count **carefully**.'}}
    );

    expect(screen.getByText('carefully').tagName).toBe('STRONG');
  });

  describe('answer explanation', () => {
    it('shows it when revealAnswerExplanation is on and the result has one', () => {
      renderCard(
        {explanation: 'Addition combines two quantities into a sum.'},
        {revealAnswerExplanation: true}
      );

      expect(screen.getByText('Answer explanation')).toBeInTheDocument();
      expect(
        screen.getByText('Addition combines two quantities into a sum.')
      ).toBeInTheDocument();
    });

    it('hides it when revealAnswerExplanation is off', () => {
      renderCard(
        {explanation: 'Addition combines two quantities into a sum.'},
        {revealAnswerExplanation: false}
      );

      expect(screen.queryByText('Answer explanation')).not.toBeInTheDocument();
    });

    it('hides it when the result has no explanation text', () => {
      renderCard({explanation: null}, {revealAnswerExplanation: true});

      expect(screen.queryByText('Answer explanation')).not.toBeInTheDocument();
    });
  });

  describe('free response', () => {
    const FR_QUESTION: QuizQuestionSummary = {
      id: 2,
      type: 'FreeResponseQuestion',
      questionName: 'Loop',
      questionTitle: 'Why does the loop stop?',
      page: 1,
    };

    it("shows the student's answer text, without a choice list", () => {
      render(
        <QuestionResultCard
          question={FR_QUESTION}
          result={{
            ...BASE_RESULT,
            questionType: 'FreeResponseQuestion',
            quizQuestionId: 2,
            responseData: {answerText: 'x > 3'},
          }}
        />
      );

      expect(screen.getByText('Your answer')).toBeInTheDocument();
      expect(screen.getByText('x > 3')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it('says there is no answer when the question was skipped', () => {
      render(
        <QuestionResultCard
          question={FR_QUESTION}
          result={{
            ...BASE_RESULT,
            questionType: 'FreeResponseQuestion',
            quizQuestionId: 2,
            responseData: {},
          }}
          isViewingStudent
        />
      );

      expect(screen.getByText("Student's answer")).toBeInTheDocument();
      expect(screen.getByText('No answer')).toBeInTheDocument();
    });

    it('shows the explanation when revealed', () => {
      render(
        <QuestionResultCard
          question={FR_QUESTION}
          result={{
            ...BASE_RESULT,
            questionType: 'FreeResponseQuestion',
            quizQuestionId: 2,
            responseData: {answerText: 'x > 3'},
            explanation: 'The condition becomes false.',
          }}
          revealAnswerExplanation
        />
      );

      expect(
        screen.getByText('The condition becomes false.')
      ).toBeInTheDocument();
    });
  });
});
