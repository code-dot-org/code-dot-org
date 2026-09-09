import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizBuilderWorkspace from '@cdo/apps/quiz/builder/QuizBuilderWorkspace';
import {QuizBuilderQuestion} from '@cdo/apps/quiz/builder/useQuizBuilderQuestions';

const question = (
  overrides: Partial<QuizBuilderQuestion> = {}
): QuizBuilderQuestion => ({
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'Bias in a hiring model',
  stem: 'Which outcome is most concerning?',
  choices: [],
  correctChoiceId: null,
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  usedInPublishedUnit: false,
  page: 1,
  ...overrides,
});

const BASE_PROPS = {
  quizTitle: 'AI Foundations Certification Exam',
  questions: [],
  isLoading: false,
  isCreating: false,
  error: null,
  createQuestion: jest.fn(),
  reload: jest.fn(),
};

function renderWorkspace(
  overrides: Partial<React.ComponentProps<typeof QuizBuilderWorkspace>> = {}
) {
  return render(<QuizBuilderWorkspace {...BASE_PROPS} {...overrides} />);
}

describe('QuizBuilderWorkspace', () => {
  it('shows a loading message while questions load', () => {
    renderWorkspace({isLoading: true});
    expect(screen.getByText('Loading questions…')).toBeInTheDocument();
  });

  it('shows an empty message when the quiz has no questions', () => {
    renderWorkspace();
    expect(
      screen.getByText('This quiz has no questions yet.')
    ).toBeInTheDocument();
    expect(screen.getByText('0 questions')).toBeInTheDocument();
  });

  it('lists each placed question with its type, name, and stem', () => {
    renderWorkspace({
      questions: [
        question(),
        question({
          id: 2,
          questionName: 'Reducing harm',
          stem: 'Which practices?',
        }),
      ],
    });

    expect(screen.getByText('2 questions')).toBeInTheDocument();
    expect(screen.getAllByText('Multiple choice')).toHaveLength(2);
    expect(screen.getByText('Bias in a hiring model')).toBeInTheDocument();
    expect(
      screen.getByText('Which outcome is most concerning?')
    ).toBeInTheDocument();
    expect(screen.getByText('Reducing harm')).toBeInTheDocument();
  });

  it('calls createQuestion when the create button is clicked', () => {
    const createQuestion = jest.fn();
    renderWorkspace({createQuestion});

    fireEvent.click(screen.getByRole('button', {name: '+ Create question'}));

    expect(createQuestion).toHaveBeenCalledTimes(1);
  });

  it('disables the create button while a create is in flight', () => {
    renderWorkspace({isCreating: true});
    expect(
      screen.getByRole('button', {name: '+ Create question'})
    ).toBeDisabled();
  });

  it('renders a server error', () => {
    renderWorkspace({error: 'Something went wrong.'});
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong.'
    );
  });
});
