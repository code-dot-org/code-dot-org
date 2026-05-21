import {Tour} from 'shepherd.js';

import {
  createReviewSyllabusHomepageSteps,
  createReviewSyllabusUnitOverviewSteps,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
  UNIT_BREADCRUMB_STEP_ID,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/reviewSyllabusOnboarding';
import {trySetSessionStorage} from '@cdo/apps/utils';

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

  it('returns empty array for demoType "middle"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'middle'
    );
    expect(steps).toEqual([]);
  });

  it('returns empty array for demoType "elementary"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusHomepageSteps(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      'elementary'
    );
    expect(steps).toEqual([]);
  });
});

describe('createReviewSyllabusUnitOverviewSteps', () => {
  it('returns steps for demoType "high"', () => {
    const tour = makeMockTour();
    const steps = createReviewSyllabusUnitOverviewSteps(tour, 'high');
    expect(steps.length).toBeGreaterThan(0);
  });

  it('returns empty array for demoType "middle"', () => {
    const tour = makeMockTour();
    expect(createReviewSyllabusUnitOverviewSteps(tour, 'middle')).toEqual([]);
  });

  it('returns empty array for demoType "elementary"', () => {
    const tour = makeMockTour();
    expect(createReviewSyllabusUnitOverviewSteps(tour, 'elementary')).toEqual(
      []
    );
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

  it('saves UNIT_BREADCRUMB_STEP_ID to sessionStorage when a dropdown item is clicked', () => {
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
      UNIT_BREADCRUMB_STEP_ID
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
    const steps = createReviewSyllabusUnitOverviewSteps(tour, 'high');
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
