import {fireEvent, render, screen, within} from '@testing-library/react';
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
  overrides: Partial<
    Extract<QuizBuilderQuestion, {type: 'MultipleChoiceQuestion'}>
  > = {}
): QuizBuilderQuestion => ({
  id: 1,
  type: 'MultipleChoiceQuestion',
  questionName: 'JavaScript variable fundamentals',
  questionTitle: 'What is a variable in JavaScript?',
  choices: [],
  correctChoiceId: null,
  description: null,
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

// Opens the nth "Create question" dropdown and picks a question type.
function createFromDropdown(index: number, typeLabel: string) {
  const trigger = screen.getAllByRole('button', {name: 'Create question'})[
    index
  ];
  fireEvent.click(trigger);
  const dropdown = trigger.closest('[id$="-dropdown"]') as HTMLElement;
  fireEvent.click(within(dropdown).getByRole('button', {name: typeLabel}));
}

function choosePageOption(page: number, optionLabel: string) {
  fireEvent.click(screen.getByRole('button', {name: `Page ${page} options`}));
  const dropdown = document.getElementById(
    `page-${page}-options-dropdown`
  ) as HTMLElement;
  fireEvent.click(within(dropdown).getByRole('button', {name: optionLabel}));
}

function renderWorkspace(
  stateOverrides: Partial<QuizBuilderQuestionsState> = {},
  propOverrides: Partial<React.ComponentProps<typeof QuizBuilderWorkspace>> = {}
) {
  mockUseQuizBuilderQuestions.mockReturnValue({
    ...BASE_STATE,
    ...stateOverrides,
  });
  return render(
    <QuizBuilderWorkspace
      levelId={42}
      quizTitle="AI Foundations Certification Exam"
      showIntroScreen={false}
      customIntroText=""
      hasTimeLimit={false}
      allowMultipleAttempts={false}
      onSaveQuizConfig={jest.fn()}
      {...propOverrides}
    />
  );
}

describe('QuizBuilderWorkspace', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('shows the intro screen card, with its content, when the intro screen is on', () => {
    renderWorkspace(
      {},
      {showIntroScreen: true, customIntroText: 'You have 45 minutes.'}
    );
    expect(screen.getByText('Intro Screen')).toBeInTheDocument();
    expect(screen.getByText('You have 45 minutes.')).toBeInTheDocument();
  });

  it('hides the intro screen card when the intro screen is off', () => {
    renderWorkspace({}, {showIntroScreen: false});
    expect(screen.queryByText('Intro Screen')).not.toBeInTheDocument();
  });

  it('fetches questions for the given level', () => {
    renderWorkspace();
    expect(mockUseQuizBuilderQuestions).toHaveBeenCalledWith(42);
  });

  it('shows a loading message while questions load', () => {
    renderWorkspace({isLoading: true});
    expect(screen.getByText('Loading questions…')).toBeInTheDocument();
  });

  it('shows an empty quiz region when the quiz has no questions', () => {
    renderWorkspace();
    expect(
      screen.getByRole('heading', {level: 2, name: 'This quiz is empty'})
    ).toBeInTheDocument();
    expect(
      screen.getByText('Start by creating a new question or adding a page.')
    ).toBeInTheDocument();
    expect(screen.getByText('0 questions')).toBeInTheDocument();
    expect(screen.getByText('1 attempt')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'New page'})).toBeEnabled();
  });

  it('shows time limit and unlimited attempts in the workspace header', () => {
    renderWorkspace({}, {timeLimitMinutes: 45, allowMultipleAttempts: true});
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();
    expect(screen.queryByText('1 attempt')).not.toBeInTheDocument();
  });

  it('lists each placed question with its name and question title', () => {
    renderWorkspace({
      questions: [
        question(),
        question({
          id: 2,
          questionName: 'MVC frameworks',
          questionTitle: 'Which MVC framework is most popular?',
        }),
      ],
    });

    // A single page stays a flat outline, so the count is only the workspace total.
    expect(screen.getAllByText('2 questions')).toHaveLength(1);
    expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
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

    createFromDropdown(0, 'Multiple choice');
    expect(screen.getByRole('tab', {name: 'Question'})).toBeInTheDocument();
  });

  it('calls addPendingQuestion with page 1 and the chosen type from the empty state', () => {
    const addPendingQuestion = jest.fn();
    renderWorkspace({addPendingQuestion});

    createFromDropdown(0, 'Free response');

    expect(addPendingQuestion).toHaveBeenCalledWith(1, 'FreeResponseQuestion');
  });

  it("creates a question on the page whose row's button was clicked", () => {
    const addPendingQuestion = jest.fn();
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 2, questionName: 'MVC frameworks'}),
      ],
      addPendingQuestion,
    });

    expect(
      screen.getAllByRole('button', {name: 'Create question'})
    ).toHaveLength(2);

    createFromDropdown(1, 'Multiple choice');
    expect(addPendingQuestion).toHaveBeenCalledWith(
      2,
      'MultipleChoiceQuestion'
    );
  });

  it('adds an empty page one past the last existing page without creating a question', async () => {
    const addPendingQuestion = jest.fn();
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 3, questionName: 'MVC frameworks'}),
      ],
      addPendingQuestion,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));
    expect(addPendingQuestion).not.toHaveBeenCalled();
    expect(screen.getByText('Page 4')).toBeInTheDocument();
    expect(screen.getByText('This page is empty')).toBeInTheDocument();
    const addPage = screen.getByRole('button', {name: 'Add page'});
    expect(addPage).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseOver(addPage);
    expect(
      await screen.findByRole('tooltip', {name: 'You have an empty page'})
    ).toBeInTheDocument();

    createFromDropdown(2, 'Free response');
    expect(addPendingQuestion).toHaveBeenCalledWith(4, 'FreeResponseQuestion');
  });

  it('hides create actions while questions are still loading', () => {
    renderWorkspace({isLoading: true});
    expect(
      screen.queryByRole('button', {name: 'Create question'})
    ).not.toBeInTheDocument();
  });

  it('disables create while a pending question already exists, but still allows adding a page', async () => {
    renderWorkspace({questions: [question({id: -1})]});
    const createQuestion = screen.getByRole('button', {
      name: 'Create question',
    });
    const addPage = screen.getByRole('button', {name: 'Add page'});
    expect(createQuestion).toHaveAttribute('aria-disabled', 'true');
    expect(addPage).not.toHaveAttribute('aria-disabled', 'true');

    fireEvent.mouseOver(createQuestion);
    expect(
      await screen.findByRole('tooltip', {
        name: 'You have a new unsaved question',
      })
    ).toBeInTheDocument();
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
      error: 'question title cannot be blank',
      errorQuestionId: 1,
    });

    // Suppressed until that card is expanded - the banner stays hidden
    // since errorQuestionId is non-null.
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'question title cannot be blank'
    );
  });

  it('does not show a question-specific error on a different card', () => {
    renderWorkspace({
      questions: [
        question(),
        question({id: 2, questionName: 'MVC frameworks'}),
      ],
      error: 'question title cannot be blank',
      errorQuestionId: 1,
    });

    fireEvent.click(screen.getAllByRole('button', {name: 'Edit question'})[1]);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('adds the first page from the empty quiz without creating a question', () => {
    const addPendingQuestion = jest.fn();
    renderWorkspace({addPendingQuestion});

    fireEvent.click(screen.getByRole('button', {name: 'New page'}));
    expect(addPendingQuestion).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Page 1'})
    ).toBeInTheDocument();
    expect(screen.getByText('This page is empty')).toBeInTheDocument();
    expect(screen.queryByText('This quiz is empty')).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Add page'})).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    createFromDropdown(0, 'Free response');
    expect(addPendingQuestion).toHaveBeenCalledWith(1, 'FreeResponseQuestion');
  });

  it('wraps a flat outline into page cards when a second page is added', () => {
    renderWorkspace({questions: [question()]});

    expect(screen.queryByText('Page 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));

    expect(
      screen.getByRole('heading', {level: 2, name: 'Page 1'})
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {level: 2, name: 'Page 2'})
    ).toBeInTheDocument();
    expect(screen.getByText('This page is empty')).toBeInTheDocument();
  });

  it('groups questions under their page, in ascending page order', () => {
    renderWorkspace({
      questions: [
        question({id: 1, questionName: 'Page two question', page: 2}),
        question({id: 2, questionName: 'Page one question', page: 1}),
      ],
    });

    const pageLabels = screen.getAllByRole('heading', {name: /^Page \d$/});
    expect(pageLabels.map(label => label.textContent)).toEqual([
      'Page 1',
      'Page 2',
    ]);
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

  it('collapses a page and expands it again, keeping other pages open', () => {
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 2, questionName: 'MVC frameworks'}),
      ],
    });

    expect(screen.getByText('JavaScript variable fundamentals')).toBeVisible();
    expect(screen.getByText('MVC frameworks')).toBeVisible();

    fireEvent.click(screen.getByRole('button', {name: 'Collapse Page 1'}));
    expect(
      screen.getByText('JavaScript variable fundamentals')
    ).not.toBeVisible();
    expect(screen.getByText('MVC frameworks')).toBeVisible();
    expect(
      screen.getByRole('button', {name: 'Expand Page 1'})
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Expand Page 1'}));
    expect(screen.getByText('JavaScript variable fundamentals')).toBeVisible();
  });

  it('deletes an empty page from the overflow menu without a confirmation', () => {
    renderWorkspace({questions: [question()]});

    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));
    expect(screen.getByText('This page is empty')).toBeVisible();

    choosePageOption(2, 'Delete page');
    expect(
      screen.queryByRole('heading', {name: 'Page 2'})
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('does not offer delete on a page that has questions', () => {
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 2, questionName: 'MVC frameworks'}),
      ],
    });

    expect(
      screen.queryByRole('button', {name: 'Page 1 options'})
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Page 2 options'})
    ).not.toBeInTheDocument();
  });
});
