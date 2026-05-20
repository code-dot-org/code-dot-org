import {StepOptions, Tour} from 'shepherd.js';

import {
  createCompletionStep,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {trySetSessionStorage} from '@cdo/apps/utils';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

export const REVIEW_SYLLABUS_ONBOARDING_STEP_KEY =
  'reviewSyllabusOnboardingCurrentStep';

const DROPDOWN_BUTTON_ID = 'go-to-lesson-dropdown-button';
const FIRST_DROPDOWN_ITEM_SELECTOR = '#go-to-lesson-dropdown ul li:first-child';
const ALL_DROPDOWN_ITEMS_SELECTOR = '#go-to-lesson-dropdown ul li';
const UNIT_BREADCRUMB_SELECTOR = '.unit-breadcrumb';
const UNIT_BREADCRUMB_LINK_SELECTOR = '.unit-breadcrumb a';
export const UNIT_BREADCRUMB_STEP_ID = 'unit-breadcrumb-step';

const withSparkle = (text: string): string => `
  <div class="onboarding-step-content">
    <i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>
    <span class="onboarding-step-text">${text}</span>
  </div>
`;

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

// ── High school steps ────────────────────────────────────────────────────────

const createHighSchoolHomepageSteps = (
  tour: Tour,
  sessionStorageKey: string
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
        "Before you assign anything to students, it helps to know what's coming. The Jump to menu gets you straight to the syllabus for your assigned unit. \n Click the dropdown menu to take a look."
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
        'Your assigned unit is right at the top. Click it to see the full lesson breakdown before your students do. \n Click the unit name to continue.'
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
            trySetSessionStorage(sessionStorageKey, UNIT_BREADCRUMB_STEP_ID);
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
    {
      id: 'teacher-resources-dropdown',
      attachTo: {
        element: '#teacher-resources-dropdown',
        on: 'bottom',
      },
      text: withSparkle(
        'If admin asks what standards you’re covering or you need a refresher before starting something new, the implementation guides, standards alignment, and how-tos are all here.'
      ),
      buttons: [nextButton(tour)],
      when: highlightAttachedElement('#teacher-resources-dropdown'),
    },
  ];
};

const QUIZ_LEVEL_QUESTION = `
  <div class="onboarding-step-content">
    <i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>
    <span class="onboarding-step-text">When you&#8217;re prepping a lesson, you don&#8217;t have time to review every single level &#8212; and you don&#8217;t need to. CodeAI highlights the levels most worth your attention. For Lesson 1, which level would you prioritize reviewing?</span>
  </div>
  <div class="quiz-options-grid">
    <button class="quiz-option" data-answer="wrong" type="button">Level 1</button>
    <button class="quiz-option" data-answer="wrong" type="button">Level 2</button>
    <button class="quiz-option" data-answer="wrong" type="button">Level 3</button>
    <button class="quiz-option" data-answer="correct" type="button">Level 4</button>
  </div>
  <div class="quiz-feedback" aria-live="polite"></div>
`;

const createHighSchoolUnitOverviewSteps = (tour: Tour): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  let breadcrumbClickHandler: ((e: Event) => void) | null = null;
  let quizClickHandler: EventListener | null = null;
  let quizAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  return [
    {
      id: UNIT_BREADCRUMB_STEP_ID,
      attachTo: {
        element: UNIT_BREADCRUMB_SELECTOR,
        on: 'bottom',
      },
      text: withSparkle(
        'The Course page is where you can map out what students will learn, lesson by lesson. Need to zoom out and see the bigger picture for the full course? Click the course name above the unit header.'
      ),
      buttons: [nextButton(tour)],
      beforeShowPromise: () =>
        waitForElement(UNIT_BREADCRUMB_SELECTOR, controller.signal),
      // No advanceOn: we prevent default on the anchor click so the celebration
      // popup can appear before navigation, then let the tour buttons decide
      // where to go.
      when: {
        show() {
          document
            .querySelector(UNIT_BREADCRUMB_SELECTOR)
            ?.classList.add('tour-step-highlight');

          breadcrumbClickHandler = (e: Event) => {
            e.preventDefault();
            document
              .querySelector(UNIT_BREADCRUMB_SELECTOR)
              ?.classList.remove('tour-step-highlight');
            if (breadcrumbClickHandler !== null) {
              document
                .querySelector(UNIT_BREADCRUMB_LINK_SELECTOR)
                ?.removeEventListener('click', breadcrumbClickHandler);
            }
            breadcrumbClickHandler = null;
            tour.next();
          };

          document
            .querySelector(UNIT_BREADCRUMB_LINK_SELECTOR)
            ?.addEventListener('click', breadcrumbClickHandler);
        },
        hide() {
          document
            .querySelector(UNIT_BREADCRUMB_SELECTOR)
            ?.classList.remove('tour-step-highlight');
          if (breadcrumbClickHandler !== null) {
            document
              .querySelector(UNIT_BREADCRUMB_LINK_SELECTOR)
              ?.removeEventListener('click', breadcrumbClickHandler);
            breadcrumbClickHandler = null;
          }
        },
      },
    },
    {
      id: 'quiz-level-priority',
      attachTo: {
        element: '#progress-lesson-1',
        on: 'left',
      },
      text: QUIZ_LEVEL_QUESTION,
      buttons: [],
      beforeShowPromise: () =>
        waitForElement('#progress-lesson-1', controller.signal),
      when: {
        show() {
          quizAdvanceTimer = null;

          document
            .querySelectorAll<HTMLButtonElement>('.quiz-option')
            .forEach(btn => {
              btn.dataset.originalText = btn.textContent?.trim() ?? '';
            });

          quizClickHandler = (e: Event) => {
            const target = e.currentTarget as HTMLButtonElement;
            const allOptions = Array.from(
              document.querySelectorAll<HTMLButtonElement>('.quiz-option')
            );

            if (target.dataset.answer === 'correct') {
              target.classList.add('quiz-option-correct');
              allOptions.forEach(btn => {
                btn.disabled = true;
              });
              quizAdvanceTimer = setTimeout(() => {
                quizAdvanceTimer = null;
                tour.next();
              }, 1000);
            } else {
              allOptions.forEach(btn => {
                if (btn.classList.contains('quiz-option-wrong')) {
                  btn.classList.remove('quiz-option-wrong');
                  btn.textContent = btn.dataset.originalText ?? '';
                  btn.disabled = false;
                }
              });
              target.classList.add('quiz-option-wrong');
              target.textContent = `❌ ${
                target.dataset.originalText ?? target.textContent?.trim() ?? ''
              }`;
              target.disabled = true;
              const feedback =
                document.querySelector<HTMLElement>('.quiz-feedback');
              if (feedback)
                feedback.textContent =
                  'Take another look. The purple checkmark indicator on a level means CodeAI recommends teachers review it.';
            }
          };

          document
            .querySelectorAll<HTMLButtonElement>('.quiz-option')
            .forEach(btn => btn.addEventListener('click', quizClickHandler!));
        },
        hide() {
          if (quizAdvanceTimer !== null) {
            clearTimeout(quizAdvanceTimer);
            quizAdvanceTimer = null;
          }
          if (quizClickHandler !== null) {
            document
              .querySelectorAll<HTMLButtonElement>('.quiz-option')
              .forEach(btn =>
                btn.removeEventListener('click', quizClickHandler!)
              );
            quizClickHandler = null;
          }
        },
      },
    },
    {
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
    },
    createCompletionStep(tour, 'Review the Syllabus', 'Stay on this page'),
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
      return createHighSchoolHomepageSteps(tour, sessionStorageKey);
    default:
      return [];
  }
};

// Steps shown on the unit overview page after navigating from the homepage.
export const createReviewSyllabusUnitOverviewSteps = (
  tour: Tour,
  demoType: DemoType
): StepOptions[] => {
  switch (demoType) {
    case 'high':
      return createHighSchoolUnitOverviewSteps(tour);
    default:
      return [];
  }
};
