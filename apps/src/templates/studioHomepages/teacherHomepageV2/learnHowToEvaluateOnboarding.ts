import {StepOptions, Tour} from 'shepherd.js';

import {
  createCompletionStep,
  createQuizWhenHandlers,
  nextButton,
  withSparkle,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {trySetSessionStorage} from '@cdo/apps/utils';

export const LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY =
  'learnHowToEvaluateOnboardingCurrentStep';

// Matches the View progress button on DemoSectionCard (no real sections yet)
// or the TaskButton NavLink on SectionCardBody (demo section already created).
const VIEW_PROGRESS_SELECTOR =
  '#ui-test-demo-section-action-progress, [id^="task-button-View-progress-"]';
const PROGRESS_TABLE_SELECTOR = '#ui-test-progress-table-v2';
const STUDENT_SNAPSHOT_SELECTOR = 'a[href*="student_snapshot"]';
const LESSON_INSIGHT_WIDGET_SELECTOR = '#ui-test-lesson-insight-widget';
const LESSON_FEEDBACK_WIDGET_SELECTOR = '#ui-test-lesson-feedback-widget';
const CFU_WIDGET_SELECTOR = '#ui-test-cfu-widget';
const STUDENT_ROW_PREFIX = 'ui-test-student-row-unexpanded-';
const CORRECT_STUDENT = 'Samir Patel';

export const PROGRESS_TABLE_STEP_ID = 'progress-table-step';
export const STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID =
  'student-snapshot-ai-insights-step';

const waitForElement = (
  selector: string,
  signal?: AbortSignal,
  timeoutMs = 10000
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }

    const cleanup = () => {
      clearTimeout(timer);
      observer.disconnect();
    };

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        cleanup();
        resolve();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});

    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(`Element "${selector}" not found within ${timeoutMs}ms`)
      );
    }, timeoutMs);

    signal?.addEventListener(
      'abort',
      () => {
        cleanup();
        reject(new DOMException('Tour cancelled', 'AbortError'));
      },
      {once: true}
    );
  });

const getStudentNamesFromDOM = (): string[] => {
  const els = document.querySelectorAll(`[id^="${STUDENT_ROW_PREFIX}"]`);
  const others: string[] = [];
  els.forEach(el => {
    const name = el.id.replace(STUDENT_ROW_PREFIX, '');
    if (name && name !== CORRECT_STUDENT) others.push(name);
  });
  return [CORRECT_STUDENT, ...others.slice(0, 2)];
};

const buildQuizHtml = (studentNames: string[]): string => {
  const buttons = studentNames
    .map(name => {
      const answer = name === CORRECT_STUDENT ? 'correct' : 'wrong';
      return `<button class="quiz-option" data-answer="${answer}" type="button">${name}</button>`;
    })
    .join('\n');

  return `
  <div class="onboarding-step-content">
    <i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>
    <span class="onboarding-step-text">At a glance, you can see each student's status across recent lessons. Based on the icon key above, which student may benefit from a check-in?</span>
  </div>
  <div class="quiz-options-grid">
    ${buttons}
  </div>
  <div class="quiz-feedback" aria-live="polite"></div>
`;
};

// Homepage steps
export const createLearnHowToEvaluateHomepageSteps = (
  tour: Tour,
  sessionStorageKey: string
): StepOptions[] => {
  let viewProgressClickHandler: (() => void) | null = null;

  return [
    {
      id: 'view-progress-step',
      attachTo: {
        element: VIEW_PROGRESS_SELECTOR,
        on: 'bottom',
      },
      text: withSparkle(
        'Once a unit is underway, students move at different speeds. This is where you can view student progress at a glance once a unit is underway.',
        'Click View progress to continue.'
      ),
      when: {
        show() {
          document
            .querySelector(VIEW_PROGRESS_SELECTOR)
            ?.classList.add('tour-step-highlight');

          viewProgressClickHandler = () => {
            trySetSessionStorage(sessionStorageKey, PROGRESS_TABLE_STEP_ID);
            document
              .querySelector(VIEW_PROGRESS_SELECTOR)
              ?.removeEventListener('click', viewProgressClickHandler!);
            viewProgressClickHandler = null;
            tour.getCurrentStep()?.hide();
          };

          document
            .querySelector(VIEW_PROGRESS_SELECTOR)
            ?.addEventListener('click', viewProgressClickHandler);
        },
        hide() {
          document
            .querySelector(VIEW_PROGRESS_SELECTOR)
            ?.classList.remove('tour-step-highlight');
          if (viewProgressClickHandler !== null) {
            document
              .querySelector(VIEW_PROGRESS_SELECTOR)
              ?.removeEventListener('click', viewProgressClickHandler);
            viewProgressClickHandler = null;
          }
        },
      },
    },
  ];
};

// Progress page steps

export const createLearnHowToEvaluateProgressSteps = (
  tour: Tour,
  tourName: string
): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  let snapshotClickHandler: ((e: Event) => void) | null = null;

  const hasSnapshotLink = !!document.querySelector(STUDENT_SNAPSHOT_SELECTOR);
  // Include snapshot page steps when there is a link to navigate to (progress
  // page with the feature enabled) OR when we have already navigated there
  // (resume scenario: the link is gone but the snapshot widgets are present).
  const isOnSnapshotPage =
    window.location.pathname.includes('student_snapshot');
  const includeSnapshotFlow = hasSnapshotLink || isOnSnapshotPage;

  const quizStep: StepOptions = {
    id: PROGRESS_TABLE_STEP_ID,
    classes:
      'custom-shepherd-onboarding-container onboarding-progress-table-step',
    attachTo: {
      element: PROGRESS_TABLE_SELECTOR,
      on: 'left',
    },
    text: buildQuizHtml(getStudentNamesFromDOM()),
    buttons: [],
    beforeShowPromise: () =>
      waitForElement(PROGRESS_TABLE_SELECTOR, controller.signal),
    when: createQuizWhenHandlers(
      tour,
      tourName,
      'Take another look at the status icons to find the student who is falling behind.',
      PROGRESS_TABLE_SELECTOR
    ),
  };

  const steps: StepOptions[] = [quizStep];

  if (hasSnapshotLink) {
    const snapshotLinkStep: StepOptions = {
      id: 'student-snapshot-step',
      attachTo: {
        element: STUDENT_SNAPSHOT_SELECTOR,
        on: 'right',
      },
      text: withSparkle(
        "Spotting a student's status is one thing, understanding the full story is another. The Student Snapshot gives you that detail. Click Student Snapshot to continue.",
        'Click Student Snapshot to continue.'
      ),
      buttons: [],
      beforeShowPromise: () =>
        waitForElement(STUDENT_SNAPSHOT_SELECTOR, controller.signal, 5000),
      when: {
        show() {
          document
            .querySelector(STUDENT_SNAPSHOT_SELECTOR)
            ?.classList.add('tour-step-highlight');

          snapshotClickHandler = () => {
            trySetSessionStorage(
              LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
              STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID
            );
            document
              .querySelector(STUDENT_SNAPSHOT_SELECTOR)
              ?.classList.remove('tour-step-highlight');
            if (snapshotClickHandler !== null) {
              document
                .querySelector(STUDENT_SNAPSHOT_SELECTOR)
                ?.removeEventListener('click', snapshotClickHandler);
              snapshotClickHandler = null;
            }
            tour.getCurrentStep()?.hide();
          };

          document
            .querySelector(STUDENT_SNAPSHOT_SELECTOR)
            ?.addEventListener('click', snapshotClickHandler);
        },
        hide() {
          document
            .querySelector(STUDENT_SNAPSHOT_SELECTOR)
            ?.classList.remove('tour-step-highlight');
          if (snapshotClickHandler !== null) {
            document
              .querySelector(STUDENT_SNAPSHOT_SELECTOR)
              ?.removeEventListener('click', snapshotClickHandler);
            snapshotClickHandler = null;
          }
        },
      },
    };
    steps.push(snapshotLinkStep);
  }

  if (includeSnapshotFlow) {
    const AI_FEEDBACK_STEP_ID = 'student-snapshot-ai-feedback-step';
    const CFU_STEP_ID = 'student-snapshot-cfu-step';

    const aiInsightsStep: StepOptions = {
      id: STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID,
      attachTo: {element: LESSON_INSIGHT_WIDGET_SELECTOR, on: 'bottom'},
      text: withSparkle(
        'This is the "why" behind the data. The Lesson Insight synthesizes the student\'s work and flags where they might be hitting a wall, so you can decide what kind of support they actually need.'
      ),
      buttons: [nextButton(tour)],
      beforeShowPromise: () =>
        waitForElement(LESSON_INSIGHT_WIDGET_SELECTOR, controller.signal),
      when: {
        show() {
          document
            .querySelector(LESSON_INSIGHT_WIDGET_SELECTOR)
            ?.classList.add('tour-step-highlight');
        },
        hide() {
          document
            .querySelector(LESSON_INSIGHT_WIDGET_SELECTOR)
            ?.classList.remove('tour-step-highlight');
        },
      },
    };

    const aiFeedbackStep: StepOptions = {
      id: AI_FEEDBACK_STEP_ID,
      attachTo: {element: LESSON_FEEDBACK_WIDGET_SELECTOR, on: 'bottom'},
      text: withSparkle(
        "The Teaching Assistant has already drafted feedback based on this student's work. Review it, revise to make it yours, and add a resource if helpful.  Then send it — the student will see it in their notifications next time they log in."
      ),
      buttons: [nextButton(tour)],
      beforeShowPromise: () =>
        waitForElement(LESSON_FEEDBACK_WIDGET_SELECTOR, controller.signal),
      when: {
        show() {
          document
            .querySelector(LESSON_FEEDBACK_WIDGET_SELECTOR)
            ?.classList.add('tour-step-highlight');
        },
        hide() {
          document
            .querySelector(LESSON_FEEDBACK_WIDGET_SELECTOR)
            ?.classList.remove('tour-step-highlight');
        },
      },
    };

    const cfuStep: StepOptions = {
      id: CFU_STEP_ID,
      attachTo: {element: CFU_WIDGET_SELECTOR, on: 'bottom'},
      text: withSparkle(
        "Before you look at their code, see what they understood or didn't. Their answers here often reveal the misconception underneath the bug."
      ),
      buttons: [nextButton(tour)],
      beforeShowPromise: () =>
        waitForElement(CFU_WIDGET_SELECTOR, controller.signal),
      when: {
        show() {
          document
            .querySelector(CFU_WIDGET_SELECTOR)
            ?.classList.add('tour-step-highlight');
        },
        hide() {
          document
            .querySelector(CFU_WIDGET_SELECTOR)
            ?.classList.remove('tour-step-highlight');
        },
      },
    };

    steps.push(aiInsightsStep, cfuStep, aiFeedbackStep);
  }

  steps.push(
    createCompletionStep(tour, 'Learn How to Evaluate', 'Stay on this page')
  );

  return steps;
};
