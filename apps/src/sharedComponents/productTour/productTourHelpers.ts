import Shepherd, {
  StepOptions,
  type StepOptionsButton,
  type Tour,
} from 'shepherd.js';

import {navigateToHref} from '@cdo/apps/utils';

export const nextButton = (tour: Tour): StepOptionsButton => ({
  text: 'Next',
  action: () => tour.next(),
  classes: 'custom-shepherd-button-primary',
});

export const doneButton = (tour: Tour): StepOptionsButton => ({
  text: 'Done',
  action: () => tour.complete(),
  classes: 'custom-shepherd-button-primary',
});

export const completeButton = (tour: Tour): StepOptionsButton => ({
  text: 'Complete Lesson',
  action: () => tour.complete(),
  classes: 'custom-shepherd-button-primary',
});

export const backButton = (tour: Tour): StepOptionsButton => ({
  text: 'Back',
  action: () => tour.back(),
  classes: 'custom-shepherd-button-secondary',
});

// Wraps step text with the sparkle icon layout.
export const withSparkle = (text: string, supportiveText?: string): string => `
  <div class="onboarding-step-content">
    <i class="fa-solid fa-sparkle onboarding-sparkle-icon"></i>
    <div class="onboarding-step-text-stack">
      <span class="onboarding-step-text">${text}</span>
      ${
        supportiveText
          ? `<span class="onboarding-step-supportive-text">${supportiveText}</span>`
          : ''
      }
    </div>
  </div>
`;

// Creates a reusable completion step for onboarding tours.
// Renders centered (no attachTo), shows a celebration emoji, the tour name,
// and two buttons: stay on the current page or return to the home page.
export const createCompletionStep = (
  tour: Tour,
  tourName: string,
  stayButtonLabel: string
): StepOptions => ({
  id: 'onboarding-complete',
  classes: 'custom-shepherd-onboarding-container onboarding-completion-step',
  text: `
    <div class="onboarding-completion-content">
      <span class="onboarding-completion-emoji">🎉</span>
      <strong>Great work!</strong>
      <p>You've completed the ${tourName} lesson.</p>
    </div>
  `,
  buttons: [
    {
      text: stayButtonLabel,
      action: () => tour.complete(),
      classes: 'custom-shepherd-button-primary',
    },
    {
      text: 'Return to Home page',
      action: () => {
        tour.complete();
        navigateToHref('/teacher_dashboard/home');
      },
      classes: 'custom-shepherd-button-secondary',
    },
  ],
});

// Returns show/hide handlers for a multiple-choice quiz step.
// Manages quiz option click listeners, correct/wrong feedback, and the
// 1-second delay before advancing on a correct answer.
export const createQuizWhenHandlers = (
  tour: Tour,
  wrongAnswerFeedback: string,
  highlightSelector?: string
): {show: () => void; hide: () => void} => {
  let quizClickHandler: EventListener | null = null;
  let quizAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  return {
    show() {
      if (highlightSelector) {
        document
          .querySelector(highlightSelector)
          ?.classList.add('tour-step-highlight');
      }

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
          target.textContent = `✓ ${
            target.dataset.originalText ?? target.textContent?.trim() ?? ''
          }`;
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
          target.textContent = `✗ ${
            target.dataset.originalText ?? target.textContent?.trim() ?? ''
          }`;
          target.disabled = true;
          const feedback =
            document.querySelector<HTMLElement>('.quiz-feedback');
          if (feedback) feedback.textContent = wrongAnswerFeedback;
        }
      };

      document
        .querySelectorAll<HTMLButtonElement>('.quiz-option')
        .forEach(btn => btn.addEventListener('click', quizClickHandler!));
    },

    hide() {
      if (highlightSelector) {
        document
          .querySelector(highlightSelector)
          ?.classList.remove('tour-step-highlight');
      }
      if (quizAdvanceTimer !== null) {
        clearTimeout(quizAdvanceTimer);
        quizAdvanceTimer = null;
      }
      if (quizClickHandler !== null) {
        document
          .querySelectorAll<HTMLButtonElement>('.quiz-option')
          .forEach(btn => btn.removeEventListener('click', quizClickHandler!));
        quizClickHandler = null;
      }
    },
  };
};

export const createTourWithSteps = (
  getSteps: (tour: Tour) => StepOptions[],
  additionalStepOptions?: Partial<StepOptions>
): Tour => {
  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    exitOnEsc: true,
    keyboardNavigation: true,
    defaultStepOptions: {
      cancelIcon: {enabled: true},
      scrollTo: true,
      classes: 'custom-shepherd-step-container',
      ...(additionalStepOptions ?? {}),
    },
  });
  tour.addSteps(getSteps(tour));
  return tour;
};
