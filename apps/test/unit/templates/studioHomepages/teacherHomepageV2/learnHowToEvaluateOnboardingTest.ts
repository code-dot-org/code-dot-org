import {Tour} from 'shepherd.js';

import {
  createLearnHowToEvaluateHomepageSteps,
  createLearnHowToEvaluateProgressSteps,
  LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
  PROGRESS_TABLE_STEP_ID,
  STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID,
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
    show: jest.fn(),
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

  afterEach(() => {
    document.body.innerHTML = '';
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
    (steps[0].when as {show: () => void}).show();

    document.getElementById('ui-test-demo-section-action-progress')!.click();

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
    const when = steps[0].when as {show: () => void; hide: () => void};
    when.show();

    const btn = document.getElementById(
      'ui-test-demo-section-action-progress'
    )!;
    expect(btn.classList.contains('tour-step-highlight')).toBe(true);

    when.hide();
    expect(btn.classList.contains('tour-step-highlight')).toBe(false);
  });
});

describe('createLearnHowToEvaluateProgressSteps step structure', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    document.body.innerHTML = `
      <div id="ui-test-progress-table-v2">
        <button id="ui-test-student-row-unexpanded-Samir Patel">Samir Patel</button>
        <button id="ui-test-student-row-unexpanded-Aisha Brooks">Aisha Brooks</button>
        <button id="ui-test-student-row-unexpanded-Leo Reyes">Leo Reyes</button>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('includes quiz step, no snapshot steps, and completion step when snapshot link is absent', () => {
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    expect(steps.some(s => s.id === PROGRESS_TABLE_STEP_ID)).toBe(true);
    expect(steps.some(s => s.id === 'student-snapshot-step')).toBe(false);
    expect(steps.some(s => s.id === STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID)).toBe(
      false
    );
    expect(steps.some(s => s.id === 'student-snapshot-ai-feedback-step')).toBe(
      false
    );
    expect(steps.some(s => s.id === 'student-snapshot-cfu-step')).toBe(false);
    expect(steps.some(s => s.id === 'onboarding-complete')).toBe(true);
  });

  it('includes snapshot link step and all snapshot page steps when Student Snapshot link is present', () => {
    document.body.innerHTML += `<a href="/teacher_dashboard/sections/1/student_snapshot">Student Snapshot</a>`;
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    expect(steps.some(s => s.id === 'student-snapshot-step')).toBe(true);
    expect(steps.some(s => s.id === STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID)).toBe(
      true
    );
    expect(steps.some(s => s.id === 'student-snapshot-ai-feedback-step')).toBe(
      true
    );
    expect(steps.some(s => s.id === 'student-snapshot-cfu-step')).toBe(true);
    expect(steps.some(s => s.id === 'onboarding-complete')).toBe(true);
  });

  it('quiz step text contains all three student names', () => {
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const quizStep = steps.find(s => s.id === PROGRESS_TABLE_STEP_ID)!;
    expect(quizStep.text).toContain('Samir Patel');
    expect(quizStep.text).toContain('Aisha Brooks');
    expect(quizStep.text).toContain('Leo Reyes');
  });
});

describe('progress-table-step when handler', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockTour = makeMockTour();
    document.body.innerHTML = `
      <div id="ui-test-progress-table-v2">
        <button id="ui-test-student-row-unexpanded-Samir Patel">Samir Patel</button>
        <button id="ui-test-student-row-unexpanded-Aisha Brooks">Aisha Brooks</button>
        <button id="ui-test-student-row-unexpanded-Leo Reyes">Leo Reyes</button>
      </div>
      <button class="quiz-option" data-answer="correct" type="button">Samir Patel</button>
      <button class="quiz-option" data-answer="wrong" type="button">Aisha Brooks</button>
      <button class="quiz-option" data-answer="wrong" type="button">Leo Reyes</button>
      <div class="quiz-feedback"></div>
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  const getQuizStep = (tour: Tour) => {
    const steps = createLearnHowToEvaluateProgressSteps(tour);
    const step = steps.find(s => s.id === PROGRESS_TABLE_STEP_ID)!;
    (step.when as {show: () => void}).show();
    return step;
  };

  it('correct answer marks button and advances tour after 1 second', () => {
    getQuizStep(mockTour as unknown as Tour);

    const correctBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="correct"]'
    )!;
    correctBtn.click();

    expect(correctBtn.classList.contains('quiz-option-correct')).toBe(true);
    expect(mockTour.next).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);
    expect(mockTour.next).toHaveBeenCalledTimes(1);
  });

  it('wrong answer marks button and does not advance tour', () => {
    getQuizStep(mockTour as unknown as Tour);

    const wrongBtn = document.querySelector<HTMLButtonElement>(
      '.quiz-option[data-answer="wrong"]'
    )!;
    wrongBtn.click();

    expect(wrongBtn.classList.contains('quiz-option-wrong')).toBe(true);
    expect(wrongBtn.disabled).toBe(true);
    expect(mockTour.next).not.toHaveBeenCalled();
  });
});

describe('student-snapshot-step when handler', () => {
  let mockTour: ReturnType<typeof makeMockTour>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTour = makeMockTour();
    document.body.innerHTML = `
      <div id="ui-test-progress-table-v2">
        <button id="ui-test-student-row-unexpanded-Samir Patel">Samir Patel</button>
        <button id="ui-test-student-row-unexpanded-Aisha Brooks">Aisha Brooks</button>
        <button id="ui-test-student-row-unexpanded-Leo Reyes">Leo Reyes</button>
      </div>
      <a href="/teacher_dashboard/sections/1/student_snapshot">Student Snapshot</a>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('saves the ai-insights step id to sessionStorage and allows navigation on click', () => {
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

    expect(clickEvent.defaultPrevented).toBe(false);
    expect(mockTrySetSessionStorage).toHaveBeenCalledWith(
      LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
      STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID
    );
    expect(mockTour.next).not.toHaveBeenCalled();
  });

  it('ai-insights step has two buttons that branch to cfu and feedback steps', () => {
    document.body.innerHTML += `<div id="ui-test-lesson-insight-widget"></div>`;
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const step = steps.find(
      s => s.id === STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID
    )!;
    const buttons = step.buttons as {text: string; action: () => void}[];

    expect(buttons).toHaveLength(2);

    buttons[0].action();
    expect(mockTour.show).toHaveBeenCalledWith('student-snapshot-cfu-step');

    buttons[1].action();
    expect(mockTour.show).toHaveBeenCalledWith(
      'student-snapshot-ai-feedback-step'
    );
  });

  it('ai-insights step highlights the lesson insight widget on show and removes it on hide', () => {
    document.body.innerHTML += `<div id="ui-test-lesson-insight-widget"></div>`;
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const step = steps.find(
      s => s.id === STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID
    )!;
    const when = step.when as {show: () => void; hide: () => void};

    when.show();
    expect(
      document
        .getElementById('ui-test-lesson-insight-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(true);

    when.hide();
    expect(
      document
        .getElementById('ui-test-lesson-insight-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(false);
  });

  it('ai-feedback step highlights the lesson feedback widget on show and removes it on hide', () => {
    document.body.innerHTML += `<div id="ui-test-lesson-feedback-widget"></div>`;
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const step = steps.find(s => s.id === 'student-snapshot-ai-feedback-step')!;
    const when = step.when as {show: () => void; hide: () => void};

    when.show();
    expect(
      document
        .getElementById('ui-test-lesson-feedback-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(true);

    when.hide();
    expect(
      document
        .getElementById('ui-test-lesson-feedback-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(false);
  });

  it('cfu step highlights the cfu widget on show and removes it on hide', () => {
    document.body.innerHTML += `<div id="ui-test-cfu-widget"></div>`;
    const steps = createLearnHowToEvaluateProgressSteps(
      mockTour as unknown as Tour
    );
    const step = steps.find(s => s.id === 'student-snapshot-cfu-step')!;
    const when = step.when as {show: () => void; hide: () => void};

    when.show();
    expect(
      document
        .getElementById('ui-test-cfu-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(true);

    when.hide();
    expect(
      document
        .getElementById('ui-test-cfu-widget')!
        .classList.contains('tour-step-highlight')
    ).toBe(false);
  });
});
