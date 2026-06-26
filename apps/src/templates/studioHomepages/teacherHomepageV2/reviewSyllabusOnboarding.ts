import {StepOptions, Tour} from 'shepherd.js';

import {
  createCompletionStep,
  createQuizWhenHandlers,
  nextButton,
  withSparkle,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {trySetSessionStorage} from '@cdo/apps/utils';

import {
  DemoType,
  ReviewSyllabusQuizOption,
} from '../../teacherDashboard/types/teacherSectionTypes';

export const REVIEW_SYLLABUS_ONBOARDING_STEP_KEY =
  'reviewSyllabusOnboardingCurrentStep';

const DROPDOWN_BUTTON_ID = 'go-to-lesson-dropdown-button';
const FIRST_DROPDOWN_ITEM_SELECTOR = '#go-to-lesson-dropdown ul li:first-child';
const ALL_DROPDOWN_ITEMS_SELECTOR = '#go-to-lesson-dropdown ul li';
const COURSE_HEADER_SELECTOR = '#unit-overview-page-header';
export const COURSE_HEADER_STEP_ID = 'unit-overview-page-step';

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

const highlightAttachedElement = (selector: string) => ({
  show() {
    document.querySelector(selector)?.classList.add('tour-step-highlight');
  },
  hide() {
    document.querySelector(selector)?.classList.remove('tour-step-highlight');
  },
});

// ── Quiz content ──────────────────────────────────────────────────────────────

const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildQuizHtml = (
  lesson: number,
  options: ReviewSyllabusQuizOption[]
): string =>
  `<div class="onboarding-step-content">` +
  `<i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>` +
  `<span class="onboarding-step-text">When you're prepping a lesson, you don't have time to review every single level — and you don't need to. CodeAI highlights the levels most worth your attention. For Lesson ${lesson}, which level would you prioritize reviewing?</span>` +
  `</div>` +
  `<div class="quiz-options-grid">` +
  options
    .map(
      opt =>
        `<button class="quiz-option" data-answer="${
          opt.correct ? 'correct' : 'wrong'
        }" type="button">${escapeHtml(opt.label)}</button>`
    )
    .join('') +
  `</div>` +
  `<div class="quiz-feedback" aria-live="polite"></div>`;

// ── Step builders ─────────────────────────────────────────────────────────────

const createTeacherResourcesStep = (
  tour: Tour,
  controller?: AbortController
): StepOptions => ({
  id: 'teacher-resources-dropdown',
  attachTo: {
    element: '#teacher-resources-dropdown',
    on: 'bottom',
  },
  text: withSparkle(
    "If admin asks what standards you're covering or you need a refresher before starting something new, the implementation guides, standards alignment, and how-tos are all here."
  ),
  buttons: [nextButton(tour)],
  beforeShowPromise: controller
    ? () => waitForElement('#teacher-resources-dropdown', controller.signal)
    : undefined,
  when: highlightAttachedElement('#teacher-resources-dropdown'),
});

const createLessonResourcesStep = (
  tour: Tour,
  controller: AbortController
): StepOptions => ({
  id: 'lesson-resources-intro',
  attachTo: {
    element: '#uitest-lesson-plan',
    on: 'bottom',
  },
  text: withSparkle(
    'Ready to dig into this lesson? The lesson plan, slide decks, and student activity guides are one click away. Plus you can save your own materials alongside them.'
  ),
  buttons: [nextButton(tour)],
  beforeShowPromise: () =>
    waitForElement('#uitest-lesson-plan', controller.signal),
});

const createQuizStep = (
  tour: Tour,
  controller: AbortController,
  lesson: number,
  options: ReviewSyllabusQuizOption[]
): StepOptions => {
  const lessonSelector = `#progress-lesson-${lesson}`;
  return {
    id: 'quiz-level-priority',
    classes:
      'custom-shepherd-onboarding-container onboarding-syllabus-review-level-step',
    attachTo: {
      element: lessonSelector,
      on: 'left',
    },
    text: buildQuizHtml(lesson, options),
    buttons: [],
    beforeShowPromise: () => waitForElement(lessonSelector, controller.signal),
    when: createQuizWhenHandlers(
      tour,
      'Take another look. The purple checkmark indicator on a level means CodeAI recommends teachers review it.'
    ),
  };
};

const createBreadcrumbStep = (
  tour: Tour,
  controller: AbortController
): StepOptions => ({
  id: COURSE_HEADER_STEP_ID,
  attachTo: {
    element: COURSE_HEADER_SELECTOR,
    on: 'bottom',
  },
  text: withSparkle(
    'The Course page is where you can map out what students will learn, lesson by lesson. Need to zoom out and see the bigger picture for the full course? Click the course name above the unit header.'
  ),
  buttons: [nextButton(tour)],
  beforeShowPromise: () =>
    waitForElement(COURSE_HEADER_SELECTOR, controller.signal),
  when: highlightAttachedElement(COURSE_HEADER_SELECTOR),
});

// ── Homepage steps ─────────────────────────────────────────────────────────────

const createHomepageSteps = (
  tour: Tour,
  sessionStorageKey: string,
  unitOverviewStartStepId: string
): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  let lessonClickHandler: (() => void) | null = null;
  let dropdownItems: Element[] = [];

  return [
    {
      id: 'open-lesson-dropdown',
      attachTo: {
        element: `#${DROPDOWN_BUTTON_ID}`,
        on: 'bottom',
      },
      text: withSparkle(
        "Before you assign anything to students, it helps to know what's coming. The Jump to menu gets you straight to the syllabus for your assigned unit.",
        'Click the dropdown menu to take a look.'
      ),
      advanceOn: {
        selector: `#${DROPDOWN_BUTTON_ID}`,
        event: 'click',
      },
      when: highlightAttachedElement(`#${DROPDOWN_BUTTON_ID}`),
    },
    {
      id: 'select-first-lesson',
      attachTo: {
        element: FIRST_DROPDOWN_ITEM_SELECTOR,
        on: 'right',
      },
      text: withSparkle(
        'Your assigned unit is right at the top. Click it to see the full lesson breakdown before your students do.',
        'Click the unit name to continue.'
      ),
      beforeShowPromise: () =>
        waitForElement(FIRST_DROPDOWN_ITEM_SELECTOR, controller.signal),
      // No advanceOn: clicking a lesson item causes page navigation.
      // The click handler saves the next step to sessionStorage so the
      // unit overview page can resume the tour there.
      when: {
        show() {
          document
            .querySelector(FIRST_DROPDOWN_ITEM_SELECTOR)
            ?.classList.add('tour-step-highlight');

          dropdownItems = Array.from(
            document.querySelectorAll(ALL_DROPDOWN_ITEMS_SELECTOR)
          );

          lessonClickHandler = () => {
            trySetSessionStorage(sessionStorageKey, unitOverviewStartStepId);
            dropdownItems.forEach(el =>
              el.removeEventListener('click', lessonClickHandler!)
            );
            tour.getCurrentStep()?.hide();
          };

          dropdownItems.forEach(el =>
            el.addEventListener('click', lessonClickHandler!)
          );
        },
        hide() {
          document
            .querySelector(FIRST_DROPDOWN_ITEM_SELECTOR)
            ?.classList.remove('tour-step-highlight');
          if (lessonClickHandler !== null) {
            dropdownItems.forEach(el =>
              el.removeEventListener('click', lessonClickHandler!)
            );
          }
          dropdownItems = [];
          lessonClickHandler = null;
        },
      },
    },
  ];
};

// ── Public API ───────────────────────────────────────────────────────────────

// Steps shown on the teacher homepage before navigating to a lesson.
export const createReviewSyllabusHomepageSteps = (
  tour: Tour,
  sessionStorageKey: string,
  demoType: DemoType
): StepOptions[] => {
  switch (demoType) {
    case 'high':
    case 'middle':
      return createHomepageSteps(
        tour,
        sessionStorageKey,
        COURSE_HEADER_STEP_ID
      );
    case 'elementary':
      return createHomepageSteps(
        tour,
        sessionStorageKey,
        'teacher-resources-dropdown'
      );
    default:
      return [];
  }
};

export interface ReviewSyllabusQuizConfig {
  lesson: number;
  options: ReviewSyllabusQuizOption[];
}

// Steps shown on the unit overview page after navigating from the homepage.
export const createReviewSyllabusUnitOverviewSteps = (
  tour: Tour,
  demoType: DemoType,
  quizConfig: ReviewSyllabusQuizConfig | null
): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  const lessonResourcesStep = createLessonResourcesStep(tour, controller);
  const completionStep = createCompletionStep(
    tour,
    'Review the Syllabus',
    'Stay on this page'
  );

  const quizStep = quizConfig
    ? createQuizStep(tour, controller, quizConfig.lesson, quizConfig.options)
    : null;

  switch (demoType) {
    case 'high':
    case 'middle':
      return [
        createBreadcrumbStep(tour, controller),
        createTeacherResourcesStep(tour, controller),
        ...(quizStep ? [quizStep] : []),
        lessonResourcesStep,
        completionStep,
      ];
    case 'elementary':
      return [
        createTeacherResourcesStep(tour, controller),
        ...(quizStep ? [quizStep] : []),
        lessonResourcesStep,
        completionStep,
      ];
    default:
      return [];
  }
};
