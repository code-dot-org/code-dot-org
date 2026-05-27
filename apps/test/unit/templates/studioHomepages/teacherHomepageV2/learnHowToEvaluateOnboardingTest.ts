import {Tour} from 'shepherd.js';

import {
  createLearnHowToEvaluateHomepageSteps,
  createLearnHowToEvaluateProgressSteps,
  LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
  PROGRESS_TABLE_STEP_ID,
} from '@cdo/apps/templates/studioHomepages/teacherHomepageV2/learnHowToEvaluateOnboarding';
import {trySetSessionStorage} from '@cdo/apps/utils';

jest.mock('@cdo/apps/utils', () => ({
  ...jest.requireActual('@cdo/apps/utils'),
  trySetSessionStorage: jest.fn(),
  tryGetSessionStorage: jest.fn(),
}));

const mockTrySetSessionStorage = trySetSessionStorage as jest.MockedFunction<
  typeof trySetSessionStorage
>;

const makeMockTour = () => {
  const handlers: Record<string, (() => void)[]> = {};
  const steps: {id: string}[] = [];
  return {
    on: jest.fn((event: string, cb: () => void) => {
      if (!handlers[event]) handlers[event] = [];
      handlers[event].push(cb);
    }),
    addSteps: jest.fn(),
    next: jest.fn(),
    getCurrentStep: jest.fn(() => ({hide: jest.fn()})),
    steps,
    _trigger: (event: string) => handlers[event]?.forEach(cb => cb()),
  } as unknown as Tour & {_trigger: (event: string) => void};
};

describe('createLearnHowToEvaluateHomepageSteps', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    document.body.innerHTML = `
      <button id="ui-test-demo-section-action-progress">View progress</button>
    `;
  });

  it('returns one step attached to the View progress button', () => {
    const steps = createLearnHowToEvaluateHomepageSteps(
      mockTour as unknown as Tour,
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY
    );
    expect(steps).toHaveLength(1);
    expect(steps[0].attachTo?.element).toContain('task-button-View-progress');
  });

  it('saves the progress table step id to sessionStorage when View progress is clicked', () => {
    const steps = createLearnHowToEvaluateHomepageSteps(
      mockTour as unknown as Tour,
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY
    );

    // Trigger the show lifecycle so the click handler is registered
    (steps[0].when as {show: () => void}).show();

    const btn = document.getElementById(
      'ui-test-demo-section-action-progress'
    )!;
    btn.click();

    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
      PROGRESS_TABLE_STEP_ID
    );
  });

  it('removes the highlight class when the step is hidden', () => {
    const steps = createLearnHowToEvaluateHomepageSteps(
      mockTour as unknown as Tour,
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY
    );

    (steps[0].when as {show: () => void; hide: () => void}).show();
    const btn = document.getElementById(
      'ui-test-demo-section-action-progress'
    )!;
    expect(btn.classList.contains('tour-step-highlight')).toBe(true);

    (steps[0].when as {show: () => void; hide: () => void}).hide();
    expect(btn.classList.contains('tour-step-highlight')).toBe(false);
  });
});

// ── Progress steps ────────────────────────────────────────────────────────────

describe('createLearnHowToEvaluateProgressSteps', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  const setupDOM = (withStudentSnapshot = false) => {
    const snapshotLink = withStudentSnapshot
      ? `<a href="/teacher_dashboard/sections/1/student_snapshot">Student Snapshot</a>`
      : '';
    document.body.innerHTML = `
      <div id="ui-test-progress-table-v2">
        <button id="ui-test-student-row-unexpanded-Samir Patel">Samir Patel</button>
        <button id="ui-test-student-row-unexpanded-Aisha Brooks">Aisha Brooks</button>
        <button id="ui-test-student-row-unexpanded-Leo Reyes">Leo Reyes</button>
      </div>
      ${snapshotLink}
    `;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
  });

  it('includes quiz step, no snapshot step, and completion step when snapshot link is absent', () => {
    setupDOM(false);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    expect(steps.some(s => s.id === PROGRESS_TABLE_STEP_ID)).toBe(true);
    expect(steps.some(s => s.id === 'student-snapshot-step')).toBe(false);
    expect(steps.some(s => s.id === 'onboarding-complete')).toBe(true);
  });

  it('includes snapshot step when Student Snapshot link is present', () => {
    setupDOM(true);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    expect(steps.some(s => s.id === 'student-snapshot-step')).toBe(true);
  });

  it('quiz step text contains all three student names', () => {
    setupDOM(false);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const quizStep = steps.find(s => s.id === PROGRESS_TABLE_STEP_ID)!;
    expect(quizStep.text).toContain('Samir Patel');
    expect(quizStep.text).toContain('Aisha Brooks');
    expect(quizStep.text).toContain('Leo Reyes');
  });

  it('quiz correct answer (Samir Patel) advances the tour after 1 second', () => {
    jest.useFakeTimers();
    setupDOM(false);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const quizStep = steps.find(s => s.id === PROGRESS_TABLE_STEP_ID)!;

    // Render quiz buttons into DOM so the when.show handler can find them
    document.body.innerHTML += `
      <button class="quiz-option" data-answer="correct" type="button">Samir Patel</button>
      <button class="quiz-option" data-answer="wrong" type="button">Aisha Brooks</button>
      <button class="quiz-option" data-answer="wrong" type="button">Leo Reyes</button>
      <div class="quiz-feedback"></div>
    `;

    (quizStep.when as {show: () => void}).show();

    const correctBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="correct"]'
    )!;
    correctBtn.click();

    expect(correctBtn.classList.contains('quiz-option-correct')).toBe(true);
    expect(mockTour.next).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(mockTour.next).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('quiz wrong answer marks button and does not advance tour', () => {
    setupDOM(false);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const quizStep = steps.find(s => s.id === PROGRESS_TABLE_STEP_ID)!;

    document.body.innerHTML += `
      <button class="quiz-option" data-answer="correct" type="button">Samir Patel</button>
      <button class="quiz-option" data-answer="wrong" type="button">Aisha Brooks</button>
      <button class="quiz-option" data-answer="wrong" type="button">Leo Reyes</button>
      <div class="quiz-feedback"></div>
    `;

    (quizStep.when as {show: () => void}).show();

    const wrongBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="wrong"]'
    )!;
    wrongBtn.click();

    expect(wrongBtn.classList.contains('quiz-option-wrong')).toBe(true);
    expect(wrongBtn.disabled).toBe(true);
    expect(mockTour.next).not.toHaveBeenCalled();
  });

  it('Student Snapshot step intercepts click and advances tour without navigation', () => {
    setupDOM(true);
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const snapshotStep = steps.find(s => s.id === 'student-snapshot-step')!;

    (snapshotStep.when as {show: () => void}).show();

    const link = document.querySelector<HTMLAnchorElement>(
      'a[href*="student_snapshot"]'
    )!;
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    link.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(mockTour.next).toHaveBeenCalledTimes(1);
  });
});
