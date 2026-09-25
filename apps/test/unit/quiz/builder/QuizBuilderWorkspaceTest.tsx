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
  errorQuestionId: null,
  createQuestion: jest.fn(),
  updateQuestion: jest.fn(),
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

    // Once for the workspace-wide total, once for the page 1 header - both
    // questions default to page 1.
    expect(screen.getAllByText('2 questions')).toHaveLength(2);
    expect(
      screen.getByText('JavaScript variable fundamentals')
    ).toBeInTheDocument();
    expect(
      screen.getByText('What is a variable in JavaScript?')
    ).toBeInTheDocument();
    expect(screen.getByText('MVC frameworks')).toBeInTheDocument();
  });

  it('opens a newly created question directly into editing', async () => {
    // Mirrors what the real hook does: a create appends a new question to
    // `questions` and resolves with its id. The mocked hook's return value
    // has to change too, so the appended question is actually there for
    // the workspace to expand.
    const createQuestion = jest.fn().mockImplementation(async () => {
      mockUseQuizBuilderQuestions.mockReturnValue({
        ...BASE_STATE,
        questions: [question(), question({id: 2})],
        createQuestion,
      });
      return 2;
    });
    renderWorkspace({questions: [question()], createQuestion});

    fireEvent.click(screen.getByRole('button', {name: 'Create question'}));
    await screen.findByRole('tab', {name: 'Question'});
  });

  it('creates a page 1 question from the empty state', () => {
    const createQuestion = jest.fn();
    renderWorkspace({createQuestion});

    fireEvent.click(screen.getByRole('button', {name: '+ Create question'}));

    expect(createQuestion).toHaveBeenCalledWith(1);
  });

  it("creates a question on the page whose row's button was clicked", () => {
    const createQuestion = jest.fn();
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 2, questionName: 'MVC frameworks'}),
      ],
      createQuestion,
    });

    const createButtons = screen.getAllByRole('button', {
      name: 'Create question',
    });
    expect(createButtons).toHaveLength(2);

    fireEvent.click(createButtons[1]);
    expect(createQuestion).toHaveBeenCalledWith(2);
  });

  it('adds a page one past the last existing page', () => {
    const createQuestion = jest.fn();
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 3, questionName: 'MVC frameworks'}),
      ],
      createQuestion,
    });

    fireEvent.click(screen.getByRole('button', {name: '+ Add page'}));
    expect(createQuestion).toHaveBeenCalledWith(4);
  });

  it('disables the create button while a create is in flight', () => {
    renderWorkspace({isCreating: true});
    expect(
      screen.getByRole('button', {name: '+ Create question'})
    ).toBeDisabled();
  });

  it('disables the per-page create and add-page buttons while a create is in flight', () => {
    renderWorkspace({questions: [question()], isCreating: true});
    expect(
      screen.getByRole('button', {name: 'Create question'})
    ).toBeDisabled();
    expect(screen.getByRole('button', {name: '+ Add page'})).toBeDisabled();
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

  it('groups questions under their page, in ascending page order', () => {
    renderWorkspace({
      questions: [
        question({id: 1, questionName: 'Page two question', page: 2}),
        question({id: 2, questionName: 'Page one question', page: 1}),
      ],
    });

    const pageLabels = screen.getAllByText(/^Page \d$/);
    expect(pageLabels.map(label => label.textContent)).toEqual([
      'Page 1',
      'Page 2',
    ]);
  });

  it('treats a null page the same as page 1', () => {
    renderWorkspace({
      questions: [question({id: 1, page: null})],
    });

    expect(screen.getByText('Page 1')).toBeInTheDocument();
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
