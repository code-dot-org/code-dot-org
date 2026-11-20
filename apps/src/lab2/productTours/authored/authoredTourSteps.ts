import {offset} from '@floating-ui/dom';
import {escape} from 'lodash';
import {type StepOptions, type StepOptionsButton, type Tour} from 'shepherd.js';

import {
  backButton,
  doneButton,
  nextButton,
} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import {tourAnchorSelector} from './tourAnchors';
import {onTourEvent} from './tourEvents';
import {AuthoredTour, AuthoredTourStep} from './types';

import './authoredTour.scss';

// How long a step waits for its target to appear, e.g. while the click that
// ended the previous step opens a panel.
const TARGET_WAIT_MS = 4000;

const waitForElement = (selector: string, timeoutMs: number) =>
  new Promise<void>(resolve => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }
    const finish = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        finish();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
    // Shepherd centers a step whose target is missing.
    const timer = setTimeout(finish, timeoutMs);
  });

const ABOVE_DIALOG_CLASS = 'tour-step-above-dialog';

// A step pointing inside a dialog or popover has to sit above it.
const keepAboveDialog = (tour: Tour) => {
  const step = tour.getCurrentStep();
  const inDialog = !!step?.getTarget()?.closest('.MuiModal-root');
  step?.getElement()?.classList.toggle(ABOVE_DIALOG_CLASS, inDialog);
};

// Authored copy is plain text; Shepherd inserts step text as HTML.
const toStepHtml = (text: string) => escape(text).replace(/\n/g, '<br>');

// A click requirement needs a target to click.
export const effectiveRequirement = (step: AuthoredTourStep) => {
  const requirement = step.requirement ?? {type: 'next'};
  return requirement.type === 'click' && !step.anchor
    ? {type: 'next' as const}
    : requirement;
};

// Advances the tour when the student meets the step's requirement.
const requirementHandlers = (
  tour: Tour,
  step: AuthoredTourStep,
  selector: string | undefined
): StepOptions['when'] => {
  const requirement = effectiveRequirement(step);
  if (requirement.type === 'next') {
    return {show: () => keepAboveDialog(tour)};
  }
  let stopListening: (() => void) | undefined;
  const advance = () => {
    if (tour.getCurrentStep()?.id === step.id) {
      tour.next();
    }
  };
  const stop = () => {
    stopListening?.();
    stopListening = undefined;
  };
  return {
    show() {
      keepAboveDialog(tour);
      stop();
      if (requirement.type === 'event') {
        stopListening = onTourEvent(requirement.event, advance);
      } else if (selector) {
        // Listens on the document because React may replace the target
        // element while the step is open.
        const onClick = (event: MouseEvent) => {
          if ((event.target as Element | null)?.closest?.(selector)) {
            // Lets the lab handle the click before the step closes.
            setTimeout(advance, 0);
          }
        };
        document.addEventListener('click', onClick, true);
        stopListening = () =>
          document.removeEventListener('click', onClick, true);
      }
    },
    hide: stop,
    destroy: stop,
  };
};

interface AuthoredStepOptionsParams {
  tour: Tour;
  step: AuthoredTourStep;
  index: number;
  stepCount: number;
  appName: string | undefined;
  // The tour editor shows a step as the student will see it, with buttons
  // that do nothing and no requirement to meet.
  preview?: boolean;
}

export const authoredStepOptions = ({
  tour,
  step,
  index,
  stepCount,
  appName,
  preview,
}: AuthoredStepOptionsParams): StepOptions => {
  const selector = step.anchor
    ? tourAnchorSelector(appName, step.anchor)
    : undefined;
  const isLast = index === stepCount - 1;

  const buttons: StepOptionsButton[] = [];
  if (index > 0) {
    buttons.push(backButton(tour));
  }
  if (effectiveRequirement(step).type === 'next') {
    buttons.push(isLast ? doneButton(tour) : nextButton(tour));
  }

  return {
    id: step.id,
    title: toStepHtml(step.title),
    text: toStepHtml(step.text),
    attachTo: selector
      ? {element: selector, on: step.placement ?? 'auto'}
      : undefined,
    buttons: preview
      ? buttons.map(button => ({...button, action: () => {}}))
      : buttons,
    beforeShowPromise:
      selector && !preview
        ? async () => {
            await waitForElement(selector, TARGET_WAIT_MS);
            if (
              !document.querySelector(selector) &&
              effectiveRequirement(step).type !== 'next'
            ) {
              // The student cannot meet the requirement on a centered step.
              tour.getById(step.id)?.updateStepOptions({
                buttons: [
                  ...buttons,
                  isLast ? doneButton(tour) : nextButton(tour),
                ],
              });
            }
          }
        : undefined,
    when: preview
      ? {show: () => keepAboveDialog(tour)}
      : requirementHandlers(tour, step, selector),
    floatingUIOptions: {middleware: [offset(12)]},
  };
};

export const createAuthoredTourSteps =
  (authoredTour: AuthoredTour, appName: string | undefined) =>
  (tour: Tour): StepOptions[] =>
    authoredTour.steps.map((step, index) =>
      authoredStepOptions({
        tour,
        step,
        index,
        stepCount: authoredTour.steps.length,
        appName,
      })
    );
