import {StepOptions, Tour} from 'shepherd.js';

import {nextButton} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

export const CREATE_SECTION_BUTTON_ID = 'create-section-button';

const waitForElement = (selector: string): Promise<void> =>
  new Promise<void>(resolve => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
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
): StepOptions[] => [
  {
    id: 'new-class-section',
    attachTo: {
      element: `#${CREATE_SECTION_BUTTON_ID}`,
      on: 'bottom',
    },
    text: "Every class you teach gets its own class section. When you're ready to set one up, start here. Click the button to continue.",
    advanceOn: {
      selector: `#${CREATE_SECTION_BUTTON_ID}`,
      event: 'click',
    },
    when: highlightAttachedElement(`#${CREATE_SECTION_BUTTON_ID}`),
  },
  {
    id: 'picture-login',
    attachTo: {
      element: isElementaryTeacher
        ? '.uitest-pictureLogin'
        : '.uitest-emailLogin',
      on: 'bottom',
    },
    text: isElementaryTeacher
      ? 'Select <strong>Picture Login</strong> for younger students — they can sign in using a picture instead of a password.'
      : 'Select <strong>Email Login</strong> for older students — they can sign in using their email.',
    beforeShowPromise: () =>
      waitForElement(
        isElementaryTeacher ? '.uitest-pictureLogin' : '.uitest-emailLogin'
      ),
    advanceOn: {
      selector: isElementaryTeacher
        ? '.uitest-pictureLogin'
        : '.uitest-emailLogin',
      event: 'click',
    },
    when: highlightAttachedElement(
      isElementaryTeacher ? '.uitest-pictureLogin' : '.uitest-emailLogin'
    ),
  },
  {
    id: 'name-section',
    attachTo: {
      element: '.uitest-section-name-setup',
      on: 'bottom',
    },
    text: 'Give your class section a name that makes sense to you. Most teachers use their period or class time. You can also change the avatar below to tell class sections apart at a glance.',
    beforeShowPromise: () => waitForElement('.uitest-section-name-setup'),
    buttons: [nextButton(tour)],
    when: highlightAttachedElement('.uitest-section-name-setup'),
  },
  {
    id: 'choose-curriculum',
    attachTo: {
      element: '.uitest-curriculum-quick-assign-top-row',
      on: 'top',
    },
    text: "This is where you decide what course your students will work through. The catalog is already filtered to your grade band so you're not sorting through content that isn't relevant. Not sure yet? Choose 'Decide later' and come back when you're ready.",
    beforeShowPromise: () =>
      waitForElement('.uitest-curriculum-quick-assign-top-row'),
    buttons: [nextButton(tour)],
    when: highlightAttachedElement('.uitest-curriculum-quick-assign-top-row'),
  },
];
