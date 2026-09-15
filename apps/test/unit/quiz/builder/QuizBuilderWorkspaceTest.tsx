import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import QuizBuilderWorkspace from '@cdo/apps/quiz/builder/QuizBuilderWorkspace';
import {
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
} from '@cdo/apps/quiz/builder/types';
import useQuizBuilderQuestions from '@cdo/apps/quiz/builder/useQuizBuilderQuestions';

jest.mock('@cdo/apps/quiz/builder/useQuizBuilderQuestions');
const mockUseQuizBuilderQuestions = jest.mocked(useQuizBuilderQuestions);

const question = (
  overrides: Partial<QuizBuilderQuestion> = {}
): QuizBuilderQuestion => ({
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'JavaScript variable fundamentals',
  stem: 'What is a variable in JavaScript?',
  choices: [],
  correctChoiceId: null,
  explanation: null,
  standards: [],
  attachedToOtherQuizzes: false,
  usedInPublishedUnit: false,
  page: 1,
  ...overrides,
});

const BASE_STATE: QuizBuilderQuestionsState = {
  questions: [],
  isLoading: false,
  isCreating: false,
  error: null,
  createQuestion: jest.fn(),
  load: jest.fn(),
};

function renderWorkspace(
  stateOverrides: Partial<QuizBuilderQuestionsState> = {}
) {
  mockUseQuizBuilderQuestions.mockReturnValue({
    ...BASE_STATE,
    ...stateOverrides,
  });
  return render(
    <QuizBuilderWorkspace
      levelId={42}
      quizTitle="AI Foundations Certification Exam"
    />
  );
}

describe('QuizBuilderWorkspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches questions for the given level', () => {
    renderWorkspace();
    expect(mockUseQuizBuilderQuestions).toHaveBeenCalledWith(42);
  });

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
          questionName: 'MVC frameworks',
          stem: 'Which MVC framework is most popular?',
        }),
      ],
    });

    expect(screen.getByText('2 questions')).toBeInTheDocument();
    expect(screen.getAllByText('Multiple choice')).toHaveLength(2);
    expect(
      screen.getByText('JavaScript variable fundamentals')
    ).toBeInTheDocument();
    expect(
      screen.getByText('What is a variable in JavaScript?')
    ).toBeInTheDocument();
    expect(screen.getByText('MVC frameworks')).toBeInTheDocument();
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
