import Shepherd, {
  StepOptions,
  type StepOptionsButton,
  type Tour,
} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {registerActiveTour} from '@cdo/apps/sharedComponents/productTour/activeTourTracker';
import {navigateToHref, tryGetSessionStorage} from '@cdo/apps/utils';

// Scrolls the element to the center of the viewport only if it is not already
// fully visible. Avoids jarring scroll when the target is already on screen.
export const scrollIntoViewIfNeeded = (el?: HTMLElement): void => {
  if (!el) {
    return;
  }
  const rect = el.getBoundingClientRect();
  const fullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  if (!fullyVisible) {
    el.scrollIntoView({block: 'center'});
  }
};

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
  tourName: string,
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
        const answerValue =
          target.dataset.originalText ?? target.textContent?.trim() ?? '';

        if (target.dataset.answer === 'correct') {
          target.classList.add('quiz-option-correct');
          target.textContent = `✓ ${answerValue}`;
          allOptions.forEach(btn => {
            btn.disabled = true;
          });
          recordOnboardingQuizAnswered(tour, tourName, answerValue, true);
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
          target.textContent = `✗ ${answerValue}`;
          target.disabled = true;
          const feedback =
            document.querySelector<HTMLElement>('.quiz-feedback');
          if (feedback) feedback.textContent = wrongAnswerFeedback;
          recordOnboardingQuizAnswered(tour, tourName, answerValue, false);
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

export const recordOnboardingQuizAnswered = (
  tour: Tour,
  tourName: string,
  answerValue: string,
  isCorrect: boolean
): void => {
  const stepId = tour.currentStep?.id;
  if (!stepId) return;

  analyticsReporter.sendEvent(EVENTS.ONBOARDING_QUIZ_ANSWERED, {
    tour_name: tourName,
    step_id: stepId,
    answer_value: answerValue,
    is_correct: isCorrect,
  });
};

export const recordOnboardingStepViewed = (
  tour: Tour,
  tourName: string
): void => {
  const stepId = tour.currentStep?.id;
  if (!stepId) return;

  analyticsReporter.sendEvent(EVENTS.ONBOARDING_STEP_VIEWED, {
    tour_name: tourName,
    step_id: stepId,
  });
};

export const recordOnboardingNavigation = (
  tourName: string,
  toPage: string
): void => {
  analyticsReporter.sendEvent(EVENTS.ONBOARDING_NAVIGATION, {
    tour_name: tourName,
    to_page: toPage,
  });
};

export const recordOnboardingTourAbandonment = (
  tour: Tour,
  sessionStorageKey: string,
  tourName: string
): void => {
  const pendingHandoffStepId = tryGetSessionStorage(sessionStorageKey, '');
  const currentStepId = tour.currentStep?.id;
  const isHandoff =
    pendingHandoffStepId !== '' && pendingHandoffStepId !== currentStepId;
  if (isHandoff) return;

  analyticsReporter.sendEvent(EVENTS.ONBOARDING_TOUR_ABANDONED, {
    tour_name: tourName,
    step_id: currentStepId,
  });
};

// Wires the two analytics listeners every onboarding tour instance needs —
// step-viewed on each step 'show', abandonment on 'cancel'. Shared across
// useOnboardingTour and the per-tour resume…() functions so each doesn't
// re-derive this wiring with a different tourName/sessionStorageKey pair.
export const attachOnboardingAnalytics = (
  tour: Tour,
  tourName: string,
  sessionStorageKey: string
): void => {
  tour.on('show', () => recordOnboardingStepViewed(tour, tourName));
  tour.on('cancel', () =>
    recordOnboardingTourAbandonment(tour, sessionStorageKey, tourName)
  );
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
      scrollToHandler: scrollIntoViewIfNeeded,
      classes: 'custom-shepherd-step-container',
      ...(additionalStepOptions ?? {}),
    },
  });
  tour.addSteps(getSteps(tour));
  registerActiveTour(tour);
  return tour;
};
