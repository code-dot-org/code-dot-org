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
  error: null,
  errorQuestionId: null,
  addPendingQuestion: jest.fn(),
  saveQuestion: jest.fn(),
  removeQuestion: jest.fn(),
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

  it('lists each placed question with its name and stem', () => {
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
    expect(
      screen.getByText('JavaScript variable fundamentals')
    ).toBeInTheDocument();
    expect(
      screen.getByText('What is a variable in JavaScript?')
    ).toBeInTheDocument();
    expect(screen.getByText('MVC frameworks')).toBeInTheDocument();
  });

  it('opens a newly created question directly into editing', () => {
    // Mirrors what the real hook does: a create appends a new (pending)
    // question to `questions` and returns its id synchronously. The mocked
    // hook's return value has to change too, so the appended question is
    // actually there for the workspace to expand.
    const addPendingQuestion = jest.fn().mockImplementation(() => {
      mockUseQuizBuilderQuestions.mockReturnValue({
        ...BASE_STATE,
        questions: [question(), question({id: -1})],
        addPendingQuestion,
      });
      return -1;
    });
    renderWorkspace({questions: [question()], addPendingQuestion});

    fireEvent.click(screen.getByRole('button', {name: '+ Create question'}));
    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
  });

  it('calls addPendingQuestion when the create button is clicked', () => {
    const addPendingQuestion = jest.fn();
    renderWorkspace({addPendingQuestion});

    fireEvent.click(screen.getByRole('button', {name: '+ Create question'}));

    expect(addPendingQuestion).toHaveBeenCalledTimes(1);
  });

  it('disables the create button while questions are still loading', () => {
    renderWorkspace({isLoading: true});
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

  it('shows a general error in the top banner with no card open', () => {
    renderWorkspace({
      questions: [question()],
      error: 'Something went wrong.',
      errorQuestionId: null,
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong.'
    );
  });

  it("shows a question-specific error on that question's card, not the banner", () => {
    renderWorkspace({
      questions: [question()],
      error: 'stem cannot be blank',
      errorQuestionId: 1,
    });

    // Suppressed until that card is expanded - the banner stays hidden
    // since errorQuestionId is non-null.
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));
    expect(screen.getByRole('alert')).toHaveTextContent('stem cannot be blank');
  });

  it('does not show a question-specific error on a different card', () => {
    renderWorkspace({
      questions: [
        question(),
        question({id: 2, questionName: 'MVC frameworks'}),
      ],
      error: 'stem cannot be blank',
      errorQuestionId: 1,
    });

    fireEvent.click(screen.getAllByRole('button', {name: 'Edit question'})[1]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('collapses the previously expanded question when another is opened', () => {
    renderWorkspace({
      questions: [
        question(),
        question({id: 2, questionName: 'MVC frameworks'}),
      ],
    });

    const editButtons = screen.getAllByRole('button', {name: 'Edit question'});
    fireEvent.click(editButtons[0]);
    expect(screen.getAllByRole('tab', {name: 'Question'})).toHaveLength(1);

    fireEvent.click(editButtons[1]);
    expect(screen.getAllByRole('tab', {name: 'Question'})).toHaveLength(1);
  });
});
