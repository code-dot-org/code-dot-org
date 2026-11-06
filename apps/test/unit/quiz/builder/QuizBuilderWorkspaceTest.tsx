import {fireEvent, render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  EMPTY_PAGE_REASON,
  editedQuestionsReason,
  NO_CHANGES_REASON,
  UNSAVED_QUESTION_REASON,
} from '@cdo/apps/quiz/builder/constants';
import QuizBuilderWorkspace from '@cdo/apps/quiz/builder/QuizBuilderWorkspace';
import {
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
} from '@cdo/apps/quiz/builder/types';
import useQuizBuilderQuestions from '@cdo/apps/quiz/builder/useQuizBuilderQuestions';
import {groupByPage} from '@cdo/apps/quiz/utils';

jest.mock('@cdo/apps/quiz/builder/useQuizBuilderQuestions');
const mockUseQuizBuilderQuestions = jest.mocked(useQuizBuilderQuestions);

// A question and the page the mocked hook puts it on.
type PlacedQuestion = QuizBuilderQuestion & {page: number};

const question = (
  overrides: Partial<
    Extract<QuizBuilderQuestion, {type: 'MultipleChoiceQuestion'}> & {
      page: number;
    }
  > = {}
): PlacedQuestion => ({
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
  deletable: true,
  usedInPublishedUnit: false,
  page: 1,
  ...overrides,
});

const BASE_STATE: QuizBuilderQuestionsState = {
  questions: [],
  pages: [],
  isLoading: false,
  isSavingQuiz: false,
  error: null,
  errorQuestionId: null,
  hasUnsavedLayout: false,
  addPage: jest.fn(),
  addPendingQuestion: jest.fn(),
  saveQuestion: jest.fn(),
  removeQuestion: jest.fn(),
  saveQuiz: jest.fn(),
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

function renderWorkspace(
  stateOverrides: Omit<Partial<QuizBuilderQuestionsState>, 'questions'> & {
    questions?: PlacedQuestion[];
  } = {},
  propOverrides: Partial<React.ComponentProps<typeof QuizBuilderWorkspace>> = {}
) {
  // pages defaults to the questions grouped by their page, as the hook does.
  const questions = stateOverrides.questions ?? [];
  mockUseQuizBuilderQuestions.mockReturnValue({
    ...BASE_STATE,
    pages: groupByPage(questions),
    ...stateOverrides,
  });
  return render(
    <QuizBuilderWorkspace
      levelId={42}
      quizVersion={{current: 7}}
      quizTitle="AI Foundations Certification Exam"
      showIntroScreen={false}
      customIntroText=""
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
    expect(mockUseQuizBuilderQuestions).toHaveBeenCalledWith(42, {current: 7});
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
      screen.getByText('Start by creating a new question.')
    ).toBeInTheDocument();
    expect(screen.getByText('0 questions')).toBeInTheDocument();
    expect(screen.getByText('1 attempt')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add page'})
    ).not.toBeInTheDocument();
  });

  it('shows time limit and unlimited attempts in the workspace header', () => {
    renderWorkspace({}, {timeLimitMinutes: 45, allowMultipleAttempts: true});
    expect(screen.getByText('45 minutes')).toBeInTheDocument();
    expect(screen.getByText('Unlimited attempts')).toBeInTheDocument();
    expect(screen.queryByText('1 attempt')).not.toBeInTheDocument();
  });

  it('omits the time limit from the workspace header for an untimed quiz', () => {
    renderWorkspace();
    expect(screen.queryByText(/minute/)).not.toBeInTheDocument();
    expect(screen.getByText('1 attempt')).toBeInTheDocument();
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

    // Once in the header, once on the page card.
    expect(screen.getAllByText('2 questions')).toHaveLength(2);
    expect(
      screen.getByRole('heading', {level: 2, name: 'Page 1'})
    ).toBeInTheDocument();
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
      const questions = [question(), question({id: -1})];
      mockUseQuizBuilderQuestions.mockReturnValue({
        ...BASE_STATE,
        questions,
        pages: groupByPage(questions),
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

  it('adds a page without creating a question', () => {
    const addPage = jest.fn();
    const addPendingQuestion = jest.fn();
    renderWorkspace({
      questions: [question({id: 1, page: 1})],
      addPage,
      addPendingQuestion,
    });

    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));
    expect(addPage).toHaveBeenCalled();
    expect(addPendingQuestion).not.toHaveBeenCalled();
  });

  it('shows an empty page, blocks adding another, and creates questions on it', async () => {
    const addPendingQuestion = jest.fn();
    const questions = [question({id: 1, page: 1})];
    renderWorkspace({
      questions,
      pages: [...groupByPage(questions), {page: 2, questions: []}],
      addPendingQuestion,
    });

    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByText('This page is empty')).toBeInTheDocument();
    const addPage = screen.getByRole('button', {name: 'Add page'});
    expect(addPage).toHaveAttribute('aria-disabled', 'true');
    fireEvent.mouseOver(addPage);
    expect(
      await screen.findByRole('tooltip', {
        name: EMPTY_PAGE_REASON,
      })
    ).toBeInTheDocument();

    createFromDropdown(1, 'Free response');
    expect(addPendingQuestion).toHaveBeenCalledWith(2, 'FreeResponseQuestion');
  });

  it('hides create actions while questions are still loading', () => {
    renderWorkspace({isLoading: true});
    expect(
      screen.queryByRole('button', {name: 'Create question'})
    ).not.toBeInTheDocument();
  });

  it('disables the per-page create and add-page buttons while a pending question already exists', async () => {
    renderWorkspace({questions: [question({id: -1})]});
    const createQuestion = screen.getByRole('button', {
      name: 'Create question',
    });
    expect(createQuestion).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', {name: 'Add page'})).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    fireEvent.mouseOver(createQuestion);
    expect(
      await screen.findByRole('tooltip', {
        name: UNSAVED_QUESTION_REASON,
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

  it('flags a collapsed page whose question has unsaved edits', () => {
    renderWorkspace({
      questions: [
        question({id: 1, page: 1}),
        question({id: 2, page: 2, questionName: 'MVC frameworks'}),
      ],
    });
    fireEvent.click(screen.getAllByRole('button', {name: 'Edit question'})[0]);
    fireEvent.change(
      screen.getByDisplayValue('JavaScript variable fundamentals'),
      {target: {value: 'Edited name'}}
    );

    const badge = 'Page contains an unsaved question';
    expect(screen.queryByRole('img', {name: badge})).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Collapse Page 1'}));
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Page 2'}));
    const pageOf = (name: string) => screen.getByRole('region', {name});
    expect(
      within(pageOf('Page 1')).getByRole('img', {name: badge})
    ).toBeInTheDocument();
    expect(
      within(pageOf('Page 2')).queryByRole('img', {name: badge})
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Expand Page 1'}));
    fireEvent.click(screen.getByRole('button', {name: 'Discard changes'}));
    fireEvent.click(screen.getByRole('button', {name: 'Collapse Page 1'}));
    expect(screen.queryByRole('img', {name: badge})).not.toBeInTheDocument();
  });

  describe('Save quiz', () => {
    const saveButton = () => screen.getByRole('button', {name: 'Save quiz'});

    it('is off with nothing to save', async () => {
      renderWorkspace({questions: [question()]});
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {name: NO_CHANGES_REASON})
      ).toBeInTheDocument();
    });

    it('saves the quiz when the layout has changed', () => {
      const saveQuiz = jest.fn();
      renderWorkspace({
        questions: [question()],
        hasUnsavedLayout: true,
        saveQuiz,
      });
      expect(saveButton()).not.toHaveAttribute('aria-disabled');
      fireEvent.click(saveButton());
      expect(saveQuiz).toHaveBeenCalled();
    });

    it('is off while a new question is unsaved', async () => {
      renderWorkspace({
        questions: [question({id: -1})],
        hasUnsavedLayout: true,
      });
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {
          name: UNSAVED_QUESTION_REASON,
        })
      ).toBeInTheDocument();
    });

    it('is off while a question has unsaved edits', async () => {
      const saveQuiz = jest.fn();
      renderWorkspace({
        questions: [question()],
        hasUnsavedLayout: true,
        saveQuiz,
      });
      fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));
      fireEvent.change(
        screen.getByDisplayValue('JavaScript variable fundamentals'),
        {target: {value: 'Edited name'}}
      );

      fireEvent.click(saveButton());
      expect(saveQuiz).not.toHaveBeenCalled();
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {
          name: editedQuestionsReason(1),
        })
      ).toBeInTheDocument();
    });

    it('shows that it is saving', () => {
      renderWorkspace({
        questions: [question()],
        hasUnsavedLayout: true,
        isSavingQuiz: true,
      });
      expect(screen.getByRole('button', {name: 'Saving…'})).toBeDisabled();
    });

    it('asks before leaving with unsaved changes', () => {
      renderWorkspace({questions: [question()], hasUnsavedLayout: true});
      const event = new Event('beforeunload', {cancelable: true});
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('asks before leaving with an unsaved question draft', () => {
      renderWorkspace({questions: [question()]});
      fireEvent.click(screen.getByRole('button', {name: 'Edit question'}));
      fireEvent.change(
        screen.getByDisplayValue('JavaScript variable fundamentals'),
        {target: {value: 'Edited name'}}
      );

      const event = new Event('beforeunload', {cancelable: true});
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });

    it('lets the page close with nothing unsaved', () => {
      renderWorkspace({questions: [question()]});
      const event = new Event('beforeunload', {cancelable: true});
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });
});
