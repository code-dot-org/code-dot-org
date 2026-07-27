import {Tour} from 'shepherd.js';

import {
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
  COURSE_HEADER_STEP_ID,
  createReviewSyllabusHomepageSteps,
  createReviewSyllabusUnitOverviewSteps,
  ReviewSyllabusQuizConfig,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/reviewSyllabusOnboarding';
import {trySetSessionStorage} from '@cdo/apps/utils';

const HIGH_QUIZ_CONFIG: ReviewSyllabusQuizConfig = {
  lesson: 1,
  options: [
    {label: 'Level 1', correct: false},
    {label: 'Level 2', correct: false},
    {label: 'Level 3', correct: false},
    {label: 'Level 4', correct: true},
  ],
};

const MIDDLE_QUIZ_CONFIG: ReviewSyllabusQuizConfig = {
  lesson: 3,
  options: [
    {label: 'Level 4', correct: true},
    {label: 'Level 5', correct: false},
    {label: 'Level 8', correct: false},
    {label: 'Level 11', correct: false},
  ],
};

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  trySetSessionStorage: jest.fn(),
}));

const mockTrySetSessionStorage = trySetSessionStorage as jest.MockedFunction<
  typeof trySetSessionStorage
>;

const makeMockTour = (): Tour => {
  const handlers: Record<string, () => void> = {};
  return {
    on: jest.fn((event: string, cb: () => void) => {
      handlers[event] = cb;
    }),
    next: jest.fn(),
    getCurrentStep: jest.fn().mockReturnValue({hide: jest.fn()}),
    _handlers: handlers,
  } as unknown as Tour;
};

describe('createReviewSyllabusHomepageSteps', () => {
  it('returns steps for demoType "high"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('returns steps for demoType "middle"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'middle'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('returns steps for demoType "elementary"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'elementary'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('high and middle homepage steps are identical in structure', () => {
    const tourHigh = makeMockTour();
    const tourMiddle = makeMockTour();
    const highSteps = createReviewSyllabusHomepageSteps(
      tourHigh,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    const middleSteps = createReviewSyllabusHomepageSteps(
      tourMiddle,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'middle'
    );
    expect(highSteps.map(s => s.id)).toEqual(middleSteps.map(s => s.id));
  });

  it('elementary homepage steps have the same step IDs as high school', () => {
    const tourHigh = makeMockTour();
    const tourElem = makeMockTour();
    const highSteps = createReviewSyllabusHomepageSteps(
      tourHigh,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    const elemSteps = createReviewSyllabusHomepageSteps(
      tourElem,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'elementary'
    );
    expect(elemSteps.map(s => s.id)).toEqual(highSteps.map(s => s.id));
  });
});

describe('createReviewSyllabusUnitOverviewSteps', () => {
  it('returns steps for demoType "high"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'high',
      HIGH_QUIZ_CONFIG,
      'test_tour'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('returns steps for demoType "middle"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'middle',
      MIDDLE_QUIZ_CONFIG,
      'test_tour'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('returns steps for demoType "elementary"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'elementary',
      null,
      'test_tour'
    );
    expect(steps.length).toBeGreaterThan(0);
  });

  it('high school unit overview includes breadcrumb, quiz, lesson-resources, and completion', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'high',
      HIGH_QUIZ_CONFIG,
      'test_tour'
    );
    const ids = steps.map(s => s.id);
    expect(ids).toContain(COURSE_HEADER_STEP_ID);
    expect(ids).toContain('quiz-level-priority');
    expect(ids).toContain('lesson-resources-intro');
  });

  it('middle school unit overview includes breadcrumb, quiz, lesson-resources, and completion', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'middle',
      MIDDLE_QUIZ_CONFIG,
      'test_tour'
    );
    const ids = steps.map(s => s.id);
    expect(ids).toContain(COURSE_HEADER_STEP_ID);
    expect(ids).toContain('quiz-level-priority');
    expect(ids).toContain('lesson-resources-intro');
  });

  it('elementary unit overview skips breadcrumb; omits quiz when no config is provided', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'elementary',
      null,
      'test_tour'
    );
    const ids = steps.map(s => s.id);
    expect(ids).not.toContain(COURSE_HEADER_STEP_ID);
    expect(ids).not.toContain('quiz-level-priority');
    expect(ids).toContain('lesson-resources-intro');
  });

  it('elementary unit overview always includes teacher-resources-dropdown', () => {
    const tour = makeMockTour();
    const ids = createReviewSyllabusUnitOverviewSteps(
      tour,
      'elementary',
      null,
      'test_tour'
    ).map(s => s.id);
    expect(ids).toContain('teacher-resources-dropdown');
  });

  it('high school quiz attaches to #progress-lesson-1', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'high',
      HIGH_QUIZ_CONFIG,
      'test_tour'
    );
    const quizStep = steps.find(s => s.id === 'quiz-level-priority')!;
    expect(quizStep.attachTo).toMatchObject({element: '#progress-lesson-1'});
  });

  it('middle school quiz attaches to #progress-lesson-3', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'middle',
      MIDDLE_QUIZ_CONFIG,
      'test_tour'
    );
    const quizStep = steps.find(s => s.id === 'quiz-level-priority')!;
    expect(quizStep.attachTo).toMatchObject({element: '#progress-lesson-3'});
  });

  it('middle school quiz content includes correct answer Level 4 and options 5, 8, 11', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'middle',
      MIDDLE_QUIZ_CONFIG,
      'test_tour'
    );
    const quizStep = steps.find(s => s.id === 'quiz-level-priority')!;
    const text = quizStep.text as string;
    expect(text).toContain('data-answer="correct"');
    expect(text).toContain('Level 4');
    expect(text).toContain('Level 5');
    expect(text).toContain('Level 8');
    expect(text).toContain('Level 11');
  });

  it('high school quiz content does not include Level 5, 8, or 11', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'high',
      HIGH_QUIZ_CONFIG,
      'test_tour'
    );
    const quizStep = steps.find(s => s.id === 'quiz-level-priority')!;
    const text = quizStep.text as string;
    expect(text).not.toContain('Level 5');
    expect(text).not.toContain('Level 8');
    expect(text).not.toContain('Level 11');
  });
});

describe('select-first-lesson when handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = `
      <div id="go-to-lesson-dropdown">
        <ul>
          <li>Unit 1</li>
          <li>Unit 2</li>
        </ul>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('saves COURSE_HEADER_STEP_ID to sessionStorage for demoType "high"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    const selectStep = steps.find(s => s.id === 'select-first-lesson')!;
    (selectStep.when as {show: () => void}).show();

    document.querySelector<HTMLElement>('#go-to-lesson-dropdown li')!.click();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      COURSE_HEADER_STEP_ID
    );
  });

  it('saves COURSE_HEADER_STEP_ID to sessionStorage for demoType "middle"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'middle'
    );
    const selectStep = steps.find(s => s.id === 'select-first-lesson')!;
    (selectStep.when as {show: () => void}).show();

    document.querySelector<HTMLElement>('#go-to-lesson-dropdown li')!.click();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      COURSE_HEADER_STEP_ID
    );
  });

  it('saves "teacher-resources-dropdown" to sessionStorage for demoType "elementary"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'elementary'
    );
    const selectStep = steps.find(s => s.id === 'select-first-lesson')!;
    (selectStep.when as {show: () => void}).show();

    document.querySelector<HTMLElement>('#go-to-lesson-dropdown li')!.click();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'teacher-resources-dropdown'
    );
  });

  it('removes click listeners from all items after one is clicked', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    const selectStep = steps.find(s => s.id === 'select-first-lesson')!;
    (selectStep.when as {show: () => void}).show();

    document.querySelector<HTMLElement>('#go-to-lesson-dropdown li')!.click();
    mockTrySetSessionStorage.mockClear();

    // Second click should not re-trigger the handler.
    document.querySelector<HTMLElement>('#go-to-lesson-dropdown li')!.click();
    expect(mockTrySetSessionStorage).not.toHaveBeenCalled();
  });

  it('removes highlight and cleans up on hide', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'high'
    );
    const selectStep = steps.find(s => s.id === 'select-first-lesson')!;
    const when = selectStep.when as {show: () => void; hide: () => void};
    when.show();

    const item = document.querySelector('#go-to-lesson-dropdown li')!;
    expect(item.classList.contains('tour-step-highlight')).toBe(true);

    when.hide();
    expect(item.classList.contains('tour-step-highlight')).toBe(false);
  });
});

describe('quiz-level-priority when handler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="progress-lesson-1">
        <button class="quiz-option" data-answer="wrong">Level 1</button>
        <button class="quiz-option" data-answer="wrong">Level 2</button>
        <button class="quiz-option" data-answer="wrong">Level 3</button>
        <button class="quiz-option" data-answer="correct">Level 4</button>
      </div>
      <div class="quiz-feedback"></div>
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  const getQuizStep = () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'high',
      HIGH_QUIZ_CONFIG,
      'test_tour'
    );
    const step = steps.find(s => s.id === 'quiz-level-priority')!;
    (step.when as {show: () => void}).show();
    return {tour, step};
  };

  it('marks a wrong answer and shows feedback text', () => {
    getQuizStep();
    const wrongBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="wrong"]'
    )!;
    wrongBtn.click();

    expect(wrongBtn.classList.contains('quiz-option-wrong')).toBe(true);
    expect(wrongBtn.disabled).toBe(true);
    expect(document.querySelector('.quiz-feedback')!.textContent).toMatch(
      /Take another look/
    );
  });

  it('resets a previously wrong button when a new wrong button is clicked', () => {
    getQuizStep();
    const buttons = document.querySelectorAll<HTMLButtonElement>(
      '.quiz-option[data-answer="wrong"]'
    );
    const first = buttons[0];
    const second = buttons[1];

    first.click();
    expect(first.disabled).toBe(true);

    // Re-enable first so the second click can trigger (disabled buttons don't fire click).
    first.disabled = false;
    second.click();

    expect(first.classList.contains('quiz-option-wrong')).toBe(false);
    expect(first.disabled).toBe(false);
    expect(first.textContent).toBe('Level 1');
    expect(second.classList.contains('quiz-option-wrong')).toBe(true);
  });

  it('disables all buttons and advances the tour after delay on correct answer', () => {
    const {tour} = getQuizStep();
    const correctBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="correct"]'
    )!;
    correctBtn.click();

    expect(correctBtn.classList.contains('quiz-option-correct')).toBe(true);
    document
      .querySelectorAll<HTMLButtonElement>('.quiz-option')
      .forEach(btn => expect(btn.disabled).toBe(true));

    expect(tour.next).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(tour.next).toHaveBeenCalledTimes(1);
  });

  it('clears the advance timer on hide', () => {
    const {tour, step} = getQuizStep();
    const correctBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="correct"]'
    )!;
    correctBtn.click();

    (step.when as {hide: () => void}).hide();
    jest.advanceTimersByTime(1000);

    expect(tour.next).not.toHaveBeenCalled();
  });
});

describe('middle school quiz-level-priority when handler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div id="progress-lesson-3">
        <button class="quiz-option" data-answer="correct">Level 4</button>
        <button class="quiz-option" data-answer="wrong">Level 5</button>
        <button class="quiz-option" data-answer="wrong">Level 8</button>
        <button class="quiz-option" data-answer="wrong">Level 11</button>
      </div>
      <div class="quiz-feedback"></div>
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  const getMiddleQuizStep = () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(
      tour,
      'middle',
      MIDDLE_QUIZ_CONFIG,
      'test_tour'
    );
    const step = steps.find(s => s.id === 'quiz-level-priority')!;
    (step.when as {show: () => void}).show();
    return {tour, step};
  };

  it('marks a wrong answer and shows feedback text', () => {
    getMiddleQuizStep();
    const wrongBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="wrong"]'
    )!;
    wrongBtn.click();

    expect(wrongBtn.classList.contains('quiz-option-wrong')).toBe(true);
    expect(document.querySelector('.quiz-feedback')!.textContent).toMatch(
      /Take another look/
    );
  });

  it('advances the tour after correct answer (Level 4)', () => {
    const {tour} = getMiddleQuizStep();
    const correctBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="correct"]'
    )!;
    correctBtn.click();

    expect(correctBtn.classList.contains('quiz-option-correct')).toBe(true);
    jest.advanceTimersByTime(1000);
    expect(tour.next).toHaveBeenCalledTimes(1);
  });
});
