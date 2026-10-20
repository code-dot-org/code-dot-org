import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React, {useState} from 'react';

import {Answer, StepAnswers} from '@cdo/apps/adaptive/progress';
import {
  FreeResponseQuestion,
  MultipleChoiceDiagnosticQuestion,
  QuestionsStep as Step,
} from '@cdo/apps/adaptive/types';
import QuestionsStep from '@cdo/apps/adaptive/views/steps/QuestionsStep';

const frQuestion = (
  id: number,
  text: string,
  placeholder?: string
): FreeResponseQuestion => ({
  id,
  type: 'freeResponse',
  text,
  placeholder,
});

const question = (
  id: number,
  questionTitle: string
): MultipleChoiceDiagnosticQuestion => ({
  id,
  type: 'MultipleChoiceQuestion',
  questionName: `q${id}`,
  questionTitle,
  choices: [
    {id: 'a', text: `Yes ${id}`},
    {id: 'b', text: `No ${id}`},
  ],
});

const step: Step = {
  id: 'survey',
  title: 'Quick questions',
  description: 'Tell us about yourself.',
  kind: 'questions',
  questions: [question(1, 'First question')],
};

const gradedStep: Step = {
  ...step,
  questions: [{...question(1, 'Graded question'), correctChoiceId: 'a'}],
};

const twoQuestionStep: Step = {
  ...step,
  questions: [
    {...question(1, 'First question'), correctChoiceId: 'a'},
    question(2, 'Second question'),
  ],
};

const freeResponseStep: Step = {
  id: 'reflect',
  title: 'Reflection',
  kind: 'questions',
  questions: [frQuestion(1, 'What did you learn?', 'Type here...')],
};

const mixedStep: Step = {
  ...step,
  questions: [
    question(1, 'First question'),
    frQuestion(2, 'What did you learn?'),
  ],
};

// Holds answers as PathwayApp does, so selections feed back in.
function renderStep(initial: StepAnswers = {}, content: Step = step) {
  const onComplete = jest.fn();
  const saved: [number, Answer[]][] = [];
  const Host = () => {
    const [answers, setAnswers] = useState(initial);
    return (
      <QuestionsStep
        step={content}
        answers={answers}
        onSaveAnswers={(questionId, list) => {
          saved.push([questionId, list]);
          setAnswers(prev => ({...prev, [questionId]: list}));
        }}
        onComplete={onComplete}
      />
    );
  };
  render(<Host />);
  return {onComplete, saved};
}

describe('QuestionsStep', () => {
  it('shows the title card and the question', () => {
    renderStep();
    expect(screen.getByText('Quick questions')).toBeInTheDocument();
    expect(screen.getByText('Tell us about yourself.')).toBeInTheDocument();
    expect(screen.getByText('First question')).toBeInTheDocument();
  });

  it('shows no question count for a lone question', () => {
    renderStep();
    expect(screen.queryByText(/\d+\/\d+ questions/)).not.toBeInTheDocument();
  });

  it('saves a survey answer on Submit, replacing the last one', () => {
    const {saved} = renderStep({1: [{answerId: 'a'}]});
    fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
    expect(saved).toEqual([]);
    expect(screen.getByRole('radio', {name: /No 1/})).toBeChecked();

    fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(saved).toEqual([[1, [{answerId: 'b'}]]]);
  });

  it('restores the latest saved pick', () => {
    renderStep({
      1: [{answerId: 'b'}, {answerId: 'a'}],
    });
    expect(screen.getByRole('radio', {name: /Yes 1/})).toBeChecked();
  });

  it('enables Submit once the question is answered', () => {
    const {onComplete} = renderStep();
    const submitButton = screen.getByRole('button', {name: 'Submit'});
    expect(submitButton).toBeDisabled();
    fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  describe('with several questions', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('shows them one at a time with a count', () => {
      const {onComplete} = renderStep({}, twoQuestionStep);
      expect(screen.getByText('1/2 questions')).toBeInTheDocument();
      expect(screen.queryByText('Second question')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      act(() => {
        jest.runAllTimers();
      });
      expect(screen.getByText('2/2 questions')).toBeInTheDocument();
      expect(screen.getByText('Second question')).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('radio', {name: /No 2/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('focuses the step title on the first question', () => {
      renderStep({}, twoQuestionStep);
      expect(
        screen.getByRole('heading', {name: 'Quick questions'})
      ).toHaveFocus();
    });

    it("focuses each later question's heading once it is reached", () => {
      renderStep({}, twoQuestionStep);
      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      act(() => {
        jest.runAllTimers();
      });
      expect(
        screen.getByRole('heading', {name: 'Second question'})
      ).toHaveFocus();
    });
  });

  describe('with a graded question', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('keeps a wrong answer on screen until it is corrected', () => {
      const {onComplete} = renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('Not quite. Try again.')).toBeInTheDocument();
      expect(screen.getByText('Incorrect')).toBeInTheDocument();
      act(() => {
        jest.runAllTimers();
      });
      expect(onComplete).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      expect(
        screen.queryByText('Not quite. Try again.')
      ).not.toBeInTheDocument();
    });

    it('shows Correct! and then completes the step', () => {
      const {onComplete, saved} = renderStep({}, gradedStep);
      fireEvent.click(screen.getByRole('radio', {name: /No 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      // Still focusable, so keyboard focus is not lost during the pause.
      const submitButton = screen.getByRole('button', {name: 'Submit'});
      expect(submitButton).toBeEnabled();
      expect(submitButton).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(submitButton);
      expect(onComplete).not.toHaveBeenCalled();

      act(() => {
        jest.runAllTimers();
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
      const wrong = {answerId: 'b', isCorrect: false};
      const right = {answerId: 'a', isCorrect: true};
      expect(saved).toEqual([
        [1, [wrong]],
        [1, [wrong, right]],
      ]);
    });
  });

  describe('with a free response question', () => {
    it('renders a textarea with the configured placeholder', () => {
      renderStep({}, freeResponseStep);
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'placeholder',
        'Type here...'
      );
    });

    it('disables Submit when the textarea is empty', () => {
      renderStep({}, freeResponseStep);
      expect(screen.getByRole('button', {name: 'Submit'})).toBeDisabled();
    });

    it('enables Submit once text is entered', () => {
      renderStep({}, freeResponseStep);
      fireEvent.change(screen.getByRole('textbox'), {
        target: {value: 'Some reflection.'},
      });
      expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });

    it('saves the answer and completes the step on submit', () => {
      const {onComplete, saved} = renderStep({}, freeResponseStep);
      fireEvent.change(screen.getByRole('textbox'), {
        target: {value: 'My answer.'},
      });
      fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
      expect(saved).toEqual([[1, [{answerId: '', text: 'My answer.'}]]]);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('restores a saved response from answers', () => {
      renderStep(
        {1: [{answerId: '', text: 'Previous answer.'}]},
        freeResponseStep
      );
      expect(screen.getByRole('textbox')).toHaveValue('Previous answer.');
      expect(screen.getByRole('button', {name: 'Submit'})).toBeEnabled();
    });

    it('shows no question count for a lone free response question', () => {
      renderStep({}, freeResponseStep);
      expect(screen.queryByText(/\d+\/\d+ questions/)).not.toBeInTheDocument();
    });
  });

  describe('with mixed question types', () => {
    it('shows a question count across all question types', () => {
      renderStep({}, mixedStep);
      expect(screen.getByText('1/2 questions')).toBeInTheDocument();
    });

    it('advances from MC to FR question', () => {
      renderStep({}, mixedStep);
      fireEvent.click(screen.getByRole('radio', {name: /Yes 1/}));
      fireEvent.click(screen.getByRole('button', {name: /Next/}));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('2/2 questions')).toBeInTheDocument();
    });
  });
});
