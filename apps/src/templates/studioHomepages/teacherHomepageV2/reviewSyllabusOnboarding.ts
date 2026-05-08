import {StepOptions, Tour} from 'shepherd.js';

import {createCompletionStep} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {trySetSessionStorage} from '@cdo/apps/utils';

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

// Steps shown on the teacher homepage before navigating to a lesson.
export const createReviewSyllabusHomepageSteps = (
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
        'This dropdown lets you jump directly to any lesson in your assigned course. Click it to see your lessons.'
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
        on: 'bottom',
      },
      text: withSparkle(
        'Click the first lesson to go directly to the lesson overview page.'
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
  ];
};

// Steps shown on the unit overview page after navigating from the homepage.
export const createReviewSyllabusUnitOverviewSteps = (
  tour: Tour
): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  let breadcrumbClickHandler: ((e: Event) => void) | null = null;

  return [
    {
      id: UNIT_BREADCRUMB_STEP_ID,
      attachTo: {
        element: UNIT_BREADCRUMB_SELECTOR,
        on: 'bottom',
      },
      text: withSparkle(
        'This breadcrumb link takes you back to the full course overview, where you can see all units and lessons. Click it to explore.'
      ),
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
    createCompletionStep(tour, 'Review the Syllabus', 'Stay on this page'),
  ];
};
