import {StepOptions, Tour} from 'shepherd.js';

import {
  createCompletionStep,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

// Wraps step text with the sparkle icon + text layout.
const withSparkle = (text: string): string => `
  <div class="onboarding-step-content">
    <i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>
    <span class="onboarding-step-text">${text}</span>
  </div>
`;

export const CREATE_SECTION_BUTTON_ID = 'create-section-button';

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

export const createSectionOnboardingTourSteps = (
  tour: Tour,
  isElementaryTeacher: boolean
): StepOptions[] => {
  const loginSelector = isElementaryTeacher
    ? '.uitest-pictureLogin'
    : '.uitest-emailLogin';

  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  return [
    {
      id: 'new-class-section',
      attachTo: {
        element: `#${CREATE_SECTION_BUTTON_ID}`,
        on: 'bottom',
      },
      text: withSparkle(
        "Every class you teach gets its own class section. When you're ready to set one up, start here. Click the button to continue."
      ),
      advanceOn: {
        selector: `#${CREATE_SECTION_BUTTON_ID}`,
        event: 'click',
      },
      when: highlightAttachedElement(`#${CREATE_SECTION_BUTTON_ID}`),
    },
    {
      // TODO: This will require more logic in the future once we have the grade sign up flow and need to show/hide different options based on teacher choice
      id: 'picture-login',
      attachTo: {
        element: loginSelector,
        on: 'bottom',
      },
      text: withSparkle(
        isElementaryTeacher
          ? 'Select <strong>Picture Login</strong> for younger students — they can sign in using a picture instead of a password.'
          : 'Select <strong>Email Login</strong> for older students — they can sign in using their email.'
      ),
      beforeShowPromise: () => waitForElement(loginSelector, controller.signal),
      advanceOn: {
        selector: loginSelector,
        event: 'click',
      },
      when: highlightAttachedElement(loginSelector),
    },
    {
      id: 'name-section',
      attachTo: {
        element: '#uitest-section-name-setup',
        on: 'bottom',
      },
      text: withSparkle(
        'Give your class section a name that makes sense to you. Most teachers use their period or class time. You can also change the avatar below to tell class sections apart at a glance.'
      ),
      beforeShowPromise: () =>
        waitForElement('#uitest-section-name-setup', controller.signal),
      buttons: [nextButton(tour)],
    },
    {
      id: 'choose-curriculum',
      attachTo: {
        element: '#uitest-curriculum-quick-assign-top-row',
        on: 'top',
      },
      text: withSparkle(
        "This is where you decide what course your students will work through. The catalog is already filtered to your grade band so you're not sorting through content that isn't relevant. Not sure yet? Choose 'Decide later' and come back when you're ready."
      ),
      beforeShowPromise: () =>
        waitForElement(
          '#uitest-curriculum-quick-assign-top-row',
          controller.signal
        ),
      buttons: [nextButton(tour)],
      when: highlightAttachedElement('#uitest-curriculum-quick-assign-top-row'),
    },
    {
      id: 'co-teacher-container',
      attachTo: {
        element: '#uitest-expandable-coteacher-container',
        on: 'bottom',
      },
      text: withSparkle(
        'Teaching this class with a colleague, or want a department head to be able to check in? Adding a co-teacher gives them the same access you have.'
      ),
      beforeShowPromise: () =>
        waitForElement(
          '#uitest-expandable-coteacher-container',
          controller.signal
        ),
      buttons: [nextButton(tour)],
      when: highlightAttachedElement('#uitest-expandable-coteacher-container'),
    },
    createCompletionStep(
      tour,
      'Create a Class Section',
      'Stay on Sections page'
    ),
  ];
};
