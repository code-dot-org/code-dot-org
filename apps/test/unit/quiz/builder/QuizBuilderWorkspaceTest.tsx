import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import {
  editedQuestionsReason,
  INVALID_CONFIG_REASON,
  LAST_PAGE_REASON,
  NO_CHANGES_REASON,
  PAGE_HAS_QUESTIONS_REASON,
  QUESTION_HAS_CHANGES_REASON,
  QUIZ_LOAD_FAILED_REASON,
  QUIZ_LOADING_REASON,
  QUIZ_BUILDER_HEADER_ID,
  UNSAVED_QUESTION_REASON,
} from '@cdo/apps/quiz/builder/constants';
import QuizBuilderWorkspace from '@cdo/apps/quiz/builder/QuizBuilderWorkspace';
import {
  QuizBuilderQuestion,
  QuizBuilderQuestionsState,
  QuizConfigurationData,
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
  hasLoaded: true,
  isSavingQuiz: false,
  error: null,
  errorQuestionId: null,
  hasUnsavedLayout: false,
  addPage: jest.fn(),
  movePage: jest.fn(),
  deletePage: jest.fn(),
  moveQuestion: jest.fn(),
  moveQuestionToPage: jest.fn(),
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

const CONFIG: QuizConfigurationData = {
  showCorrectness: true,
  revealAnswerExplanation: false,
  showIntroScreen: false,
  customIntroText: '',
  allowMultipleAttempts: false,
  showQuestionsAfterSubmit: false,
};

// The same configuration as edited and as saved, so nothing is unsaved.
const withConfig = (fields: Partial<QuizConfigurationData>) => ({
  config: {...CONFIG, ...fields},
  savedConfig: {...CONFIG, ...fields},
});

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
      quizTitle="AI Foundations Certification Exam"
      config={CONFIG}
      savedConfig={CONFIG}
      onConfigChange={jest.fn()}
      onConfigSaved={jest.fn()}
      {...propOverrides}
    />
  );
}

describe('QuizBuilderWorkspace', () => {
  // The page header's slot, which the haml layout renders on the build page.
  let headerSlot: HTMLElement;

  beforeEach(() => {
    jest.resetAllMocks();
    headerSlot = document.createElement('div');
    headerSlot.id = QUIZ_BUILDER_HEADER_ID;
    document.body.appendChild(headerSlot);
  });

  afterEach(() => {
    headerSlot.remove();
  });

  it('shows the intro screen card, with its content, when the intro screen is on', () => {
    renderWorkspace(
      {},
      withConfig({
        showIntroScreen: true,
        customIntroText: 'You have 45 minutes.',
      })
    );
    expect(screen.getByText('Intro Screen')).toBeInTheDocument();
    expect(screen.getByText('You have 45 minutes.')).toBeInTheDocument();
  });

  it('hides the intro screen card when the intro screen is off', () => {
    renderWorkspace({}, withConfig({showIntroScreen: false}));
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
      screen.getByText('Start by creating a new question.')
    ).toBeInTheDocument();
    expect(screen.getByText('0 questions')).toBeInTheDocument();
    expect(screen.getByText('1 attempt')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Add page'})
    ).not.toBeInTheDocument();
  });

  it('shows time limit and unlimited attempts in the workspace header', () => {
    renderWorkspace(
      {},
      withConfig({
        showIntroScreen: true,
        timeLimitMinutes: 45,
        allowMultipleAttempts: true,
      })
    );
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

  it('shows an empty page, allows adding another, and creates questions on it', () => {
    const addPage = jest.fn();
    const addPendingQuestion = jest.fn();
    const questions = [question({id: 1, page: 1})];
    renderWorkspace({
      questions,
      pages: [...groupByPage(questions), {page: 2, questions: []}],
      addPage,
      addPendingQuestion,
    });

    expect(screen.getByRole('heading', {name: 'Page 2'})).toBeInTheDocument();
    expect(screen.getByText('This page is empty')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));
    expect(addPage).toHaveBeenCalled();

    createFromDropdown(1, 'Free response');
    expect(addPendingQuestion).toHaveBeenCalledWith(2, 'FreeResponseQuestion');
  });

  it('hides create actions while questions are still loading', () => {
    renderWorkspace({isLoading: true});
    expect(
      screen.queryByRole('button', {name: 'Create question'})
    ).not.toBeInTheDocument();
  });

  it('disables creating another question, but not adding a page, while a pending question exists', async () => {
    const addPage = jest.fn();
    renderWorkspace({questions: [question({id: -1})], addPage});
    const createQuestion = screen.getByRole('button', {
      name: 'Create question',
    });
    expect(createQuestion).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('button', {name: 'Add page'}));
    expect(addPage).toHaveBeenCalled();

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

  describe('Question menu', () => {
    // Questions 1 and 2 on page 1, 3 on page 2.
    const TWO_PAGES = [
      question({id: 1, page: 1}),
      question({id: 2, page: 1, questionName: 'MVC frameworks'}),
      question({id: 3, page: 2, questionName: 'Recursion'}),
    ];
    const menuOf = (id: number) =>
      within(document.getElementById(`question-menu-${id}-dropdown`)!);

    it('turns off moves past the edges of the page', () => {
      renderWorkspace({questions: TWO_PAGES});

      expect(
        menuOf(1).getByRole('button', {name: 'Move question up'})
      ).toBeDisabled();
      expect(
        menuOf(1).getByRole('button', {name: 'Move question down'})
      ).toBeEnabled();
      expect(
        menuOf(2).getByRole('button', {name: 'Move question down'})
      ).toBeDisabled();
    });

    it('moves a question up or down', () => {
      const moveQuestion = jest.fn();
      renderWorkspace({questions: TWO_PAGES, moveQuestion});

      fireEvent.click(
        menuOf(1).getByRole('button', {name: 'Move question down'})
      );
      fireEvent.click(
        menuOf(2).getByRole('button', {name: 'Move question up'})
      );

      expect(moveQuestion).toHaveBeenCalledWith(1, 1);
      expect(moveQuestion).toHaveBeenCalledWith(2, -1);
    });

    it("moves a question to one of the quiz's other pages", () => {
      const moveQuestionToPage = jest.fn();
      renderWorkspace({questions: TWO_PAGES, moveQuestionToPage});

      expect(
        menuOf(1).queryByRole('button', {name: 'Move to Page 1'})
      ).not.toBeInTheDocument();
      fireEvent.click(menuOf(1).getByRole('button', {name: 'Move to Page 2'}));

      expect(moveQuestionToPage).toHaveBeenCalledWith(1, 2);
    });

    it('turns off moving to another page while the question has unsaved edits', () => {
      renderWorkspace({questions: TWO_PAGES});

      fireEvent.click(
        screen.getAllByRole('button', {name: 'Edit question'})[0]
      );
      fireEvent.change(
        screen.getByDisplayValue('JavaScript variable fundamentals'),
        {target: {value: 'Edited name'}}
      );

      const moveToPage = menuOf(1).getByRole('button', {
        name: 'Move to Page 2',
      });
      expect(moveToPage).toHaveAttribute('aria-disabled', 'true');
      expect(moveToPage).toHaveAccessibleDescription(
        QUESTION_HAS_CHANGES_REASON
      );
      expect(
        menuOf(1).getByRole('button', {name: 'Move question down'})
      ).toBeEnabled();
    });

    it('turns the menu off while the question is saving', () => {
      // Never resolves, so the save stays in flight.
      const saveQuestion = jest.fn(() => new Promise<number>(() => {}));
      renderWorkspace({questions: TWO_PAGES, saveQuestion});

      fireEvent.click(
        screen.getAllByRole('button', {name: 'Edit question'})[0]
      );
      fireEvent.change(
        screen.getByDisplayValue('JavaScript variable fundamentals'),
        {target: {value: 'Edited name'}}
      );
      fireEvent.click(screen.getByRole('button', {name: 'Save'}));

      expect(
        menuOf(1).getByRole('button', {name: 'Question options'})
      ).toBeDisabled();
      expect(
        menuOf(2).getByRole('button', {name: 'Question options'})
      ).toBeEnabled();
    });

    it('offers no pages to move to on a one-page quiz', () => {
      renderWorkspace({questions: [question()]});

      expect(menuOf(1).queryByText('Move to page')).not.toBeInTheDocument();
    });

    it('removes a question from the quiz', () => {
      const removeQuestion = jest.fn();
      renderWorkspace({questions: TWO_PAGES, removeQuestion});

      fireEvent.click(
        menuOf(3).getByRole('button', {name: 'Remove from quiz'})
      );

      expect(removeQuestion).toHaveBeenCalledWith(3, {permanently: true});
    });
  });

  describe('Page menu', () => {
    const pageMenuOf = (page: number) =>
      within(document.getElementById(`page-menu-${page}-dropdown`)!);
    const TWO_PAGES = [
      question({id: 1, page: 1}),
      question({id: 2, page: 2, questionName: 'MVC frameworks'}),
    ];

    it('turns off moves past the first and last page', () => {
      renderWorkspace({questions: TWO_PAGES});

      expect(
        pageMenuOf(1).getByRole('button', {name: 'Move page up'})
      ).toBeDisabled();
      expect(
        pageMenuOf(2).getByRole('button', {name: 'Move page down'})
      ).toBeDisabled();
    });

    it('moves a page and adds pages above and below it', () => {
      const movePage = jest.fn();
      const addPage = jest.fn();
      renderWorkspace({questions: TWO_PAGES, movePage, addPage});

      fireEvent.click(
        pageMenuOf(1).getByRole('button', {name: 'Move page down'})
      );
      fireEvent.click(
        pageMenuOf(2).getByRole('button', {name: 'Add page above'})
      );
      fireEvent.click(
        pageMenuOf(2).getByRole('button', {name: 'Add page below'})
      );

      expect(movePage).toHaveBeenCalledWith(1, 1);
      expect(addPage).toHaveBeenCalledWith(2);
      expect(addPage).toHaveBeenCalledWith(3);
    });

    it('adds a page while another is already empty', () => {
      const addPage = jest.fn();
      renderWorkspace({
        questions: TWO_PAGES,
        pages: [...groupByPage(TWO_PAGES), {page: 3, questions: []}],
        addPage,
      });

      fireEvent.click(
        pageMenuOf(1).getByRole('button', {name: 'Add page above'})
      );
      expect(addPage).toHaveBeenCalledWith(1);
    });

    it('deletes only an empty page, and never the last one', () => {
      const deletePage = jest.fn();
      renderWorkspace({
        questions: TWO_PAGES,
        pages: [...groupByPage(TWO_PAGES), {page: 3, questions: []}],
        deletePage,
      });

      const deleteFull = pageMenuOf(1).getByRole('button', {
        name: 'Delete page',
      });
      expect(deleteFull).toHaveAttribute('aria-disabled', 'true');
      expect(deleteFull).toHaveAccessibleDescription(PAGE_HAS_QUESTIONS_REASON);
      fireEvent.click(deleteFull);
      expect(deletePage).not.toHaveBeenCalled();

      fireEvent.click(pageMenuOf(3).getByRole('button', {name: 'Delete page'}));
      expect(deletePage).toHaveBeenCalledWith(3);
    });

    it('keeps page menus shut while a question has unsaved edits', async () => {
      renderWorkspace({questions: TWO_PAGES});

      fireEvent.click(
        screen.getAllByRole('button', {name: 'Edit question'})[0]
      );
      fireEvent.change(
        screen.getByDisplayValue('JavaScript variable fundamentals'),
        {target: {value: 'Edited name'}}
      );

      for (const page of [1, 2]) {
        expect(
          pageMenuOf(page).getByRole('button', {name: `Page ${page} options`})
        ).toHaveAttribute('aria-disabled', 'true');
      }
      fireEvent.mouseOver(
        pageMenuOf(2).getByRole('button', {name: 'Page 2 options'})
      );
      expect(
        await screen.findByRole('tooltip', {name: editedQuestionsReason(1)})
      ).toBeInTheDocument();
    });

    it('keeps the only page, even when empty', () => {
      renderWorkspace({pages: [{page: 1, questions: []}]});

      const deleteOnly = pageMenuOf(1).getByRole('button', {
        name: 'Delete page',
      });
      expect(deleteOnly).toHaveAttribute('aria-disabled', 'true');
      expect(deleteOnly).toHaveAccessibleDescription(LAST_PAGE_REASON);
    });
  });

  describe('Save quiz', () => {
    const saveButton = () => screen.getByRole('button', {name: 'Save quiz'});

    it('is in the page header', () => {
      renderWorkspace({questions: [question()]});
      expect(headerSlot).toContainElement(saveButton());
    });

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

    it('saves configuration changes, then reports what it saved', async () => {
      const saveQuiz = jest.fn().mockResolvedValue(true);
      const onConfigSaved = jest.fn();
      renderWorkspace(
        {questions: [question()], saveQuiz},
        {
          config: {...CONFIG, allowMultipleAttempts: true},
          onConfigSaved,
        }
      );
      expect(saveButton()).not.toHaveAttribute('aria-disabled');

      fireEvent.click(saveButton());

      expect(saveQuiz).toHaveBeenCalledWith({allowMultipleAttempts: true});
      await waitFor(() =>
        expect(onConfigSaved).toHaveBeenCalledWith({
          allowMultipleAttempts: true,
        })
      );
    });

    it('keeps configuration changes unsaved when the save fails', async () => {
      const saveQuiz = jest.fn().mockResolvedValue(false);
      const onConfigSaved = jest.fn();
      renderWorkspace(
        {questions: [question()], saveQuiz},
        {
          config: {...CONFIG, allowMultipleAttempts: true},
          onConfigSaved,
        }
      );

      fireEvent.click(saveButton());

      await waitFor(() => expect(saveQuiz).toHaveBeenCalled());
      expect(onConfigSaved).not.toHaveBeenCalled();
    });

    it('is off with a configuration change while the quiz is loading', async () => {
      renderWorkspace(
        {isLoading: true, hasLoaded: false},
        {config: {...CONFIG, allowMultipleAttempts: true}}
      );
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {name: QUIZ_LOADING_REASON})
      ).toBeInTheDocument();
    });

    it('is off with a configuration change after the quiz failed to load', async () => {
      const saveQuiz = jest.fn();
      renderWorkspace(
        {hasLoaded: false, error: 'Something went wrong.', saveQuiz},
        {config: {...CONFIG, allowMultipleAttempts: true}}
      );
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(saveButton());
      expect(saveQuiz).not.toHaveBeenCalled();
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {name: QUIZ_LOAD_FAILED_REASON})
      ).toBeInTheDocument();
    });

    it('is off while the configuration is invalid', async () => {
      renderWorkspace(
        {questions: [question()]},
        {config: {...CONFIG, showIntroScreen: true, timeLimitMinutes: 0}}
      );
      expect(saveButton()).toHaveAttribute('aria-disabled', 'true');
      fireEvent.mouseOver(saveButton());
      expect(
        await screen.findByRole('tooltip', {name: INVALID_CONFIG_REASON})
      ).toBeInTheDocument();
    });

    it('asks before leaving with unsaved configuration', () => {
      renderWorkspace(
        {questions: [question()]},
        {config: {...CONFIG, allowMultipleAttempts: true}}
      );
      const event = new Event('beforeunload', {cancelable: true});
      window.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
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
