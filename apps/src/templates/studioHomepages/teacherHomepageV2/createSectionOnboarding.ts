import {StepOptions, Tour} from 'shepherd.js';

import {
  nextButton,
  withSparkle,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {trySetSessionStorage} from '@cdo/apps/utils';

export const CREATE_SECTION_BUTTON_ID = 'create-section-button';

// Must match the id of the first step in createSectionsNewSteps.
const SECTIONS_NEW_FIRST_STEP_ID = 'name-section';

const LOGIN_SELECTORS = {
  picture: '.uitest-pictureLogin',
  word: '.uitest-wordLogin',
  email: '.uitest-emailLogin',
};

const HIGH_SCHOOL_GRADES = new Set(['9', '10', '11', '12']);
const ELEMENTARY_GRADES = new Set(['K', '1', '2', '3', '4', '5']);

// All grades exclusively in {9-12} → email login; all grades exclusively in
// {K-5} → picture login; mixed, middle school, or no grades → word login.
export const getLoginSelector = (
  gradesTeaching: string[] | null | undefined
): string => {
  const grades = (gradesTeaching || []).map(String);
  if (grades.length === 0) return LOGIN_SELECTORS.word;
  if (grades.every(g => HIGH_SCHOOL_GRADES.has(g)))
    return LOGIN_SELECTORS.email;
  if (grades.every(g => ELEMENTARY_GRADES.has(g)))
    return LOGIN_SELECTORS.picture;
  return LOGIN_SELECTORS.word;
};

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

// Steps shown on the teacher homepage before navigating to /sections/new.
export const createHomepageSteps = (
  tour: Tour,
  gradesTeaching: string[] | null | undefined,
  sessionStorageKey: string
): StepOptions[] => {
  const loginSelector = getLoginSelector(gradesTeaching);

  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  // Shared click handler and the elements it was attached to, tracked so
  // hide() can clean up if the step is dismissed without a click (e.g. cancel).
  let loginClickHandler: (() => void) | null = null;
  let sectionTypeButtons: Element[] = [];

  return [
    {
      id: 'new-class-section',
      attachTo: {
        element: `#${CREATE_SECTION_BUTTON_ID}`,
        on: 'bottom',
      },
      text: withSparkle(
        "Every class you teach gets its own class section. When you're ready to set one up, start here.",
        'Click New class section to continue'
      ),
      advanceOn: {
        selector: `#${CREATE_SECTION_BUTTON_ID}`,
        event: 'click',
      },
      when: highlightAttachedElement(`#${CREATE_SECTION_BUTTON_ID}`),
    },
    {
      id: 'picture-login',
      attachTo: {
        element: loginSelector,
        on: 'bottom',
      },
      text: withSparkle(
        loginSelector === LOGIN_SELECTORS.picture
          ? 'Picture logins work best for elementary classes.  They are simple for students to recognize and use for students who are new to reading.'
          : loginSelector === LOGIN_SELECTORS.email
          ? 'Personal logins work best for high school classes. Students can use their email address to sign in and reset their password if they forget it.'
          : "Secret words work best for middle school classes. They're simple enough to remember, no email account required. Select a login method to continue."
      ),
      classes: 'custom-shepherd-step-container tour-step-above-modal',
      beforeShowPromise: () => waitForElement(loginSelector, controller.signal),
      // No advanceOn: this is the last homepage step, so tour.next() would fire
      // tour.complete() and clear sessionStorage before the page navigates to
      // /sections/new. Instead, click listeners on all login options save the
      // next page's first step so resumeCreateSectionOnboardingTour resumes there.
      when: {
        show() {
          document
            .querySelector(loginSelector)
            ?.classList.add('tour-step-highlight');

          sectionTypeButtons = Object.values(LOGIN_SELECTORS)
            .map(sel => document.querySelector(sel))
            .filter((el): el is Element => el !== null);

          loginClickHandler = () => {
            trySetSessionStorage(sessionStorageKey, SECTIONS_NEW_FIRST_STEP_ID);
            sectionTypeButtons.forEach(el =>
              el.removeEventListener('click', loginClickHandler!)
            );
            // Dismiss the tooltip immediately so it doesn't float while the
            // page navigates. hide() does not fire cancel/complete, so
            // sessionStorage is preserved for the next page to resume from.
            tour.getCurrentStep()?.hide();
          };

          sectionTypeButtons.forEach(el =>
            el.addEventListener('click', loginClickHandler!)
          );
        },
        hide() {
          document
            .querySelector(loginSelector)
            ?.classList.remove('tour-step-highlight');
          if (loginClickHandler !== null) {
            sectionTypeButtons.forEach(el =>
              el.removeEventListener('click', loginClickHandler!)
            );
          }
          sectionTypeButtons = [];
          loginClickHandler = null;
        },
      },
    },
  ];
};

// Steps shown on /sections/new after navigating from the homepage.
export const createSectionsNewSteps = (tour: Tour): StepOptions[] => {
  const controller = new AbortController();
  tour.on('cancel', () => controller.abort());
  tour.on('complete', () => controller.abort());

  return [
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
        element: '#uitest-expandable-coteacher',
        on: 'bottom',
      },
      text: withSparkle(
        'Teaching this class with a colleague, or want a department head to be able to check in? Adding a co-teacher gives them the same access you have.'
      ),
      beforeShowPromise: () =>
        waitForElement('#uitest-expandable-coteacher', controller.signal),
      buttons: [nextButton(tour)],
      when: highlightAttachedElement('#uitest-expandable-coteacher'),
    },
    {
      id: 'save-section',
      attachTo: {
        element: '#uitest-save-section-changes',
        on: 'top',
      },
      text: withSparkle("You're all set! Save your class section to finish."),
      beforeShowPromise: () =>
        waitForElement('#uitest-save-section-changes', controller.signal),
      advanceOn: {
        selector: '#uitest-save-section-changes',
        event: 'click',
      },
      when: highlightAttachedElement('#uitest-save-section-changes'),
    },
  ];
};
