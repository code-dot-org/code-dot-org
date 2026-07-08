import {offset} from '@floating-ui/dom';
import Shepherd, {StepOptions, Tour} from 'shepherd.js';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';
import {scrollIntoViewIfNeeded} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

interface CreateShepherdTourOptions {
  stepClass: string;
  additionalStepOptions?: Partial<StepOptions>;
}

// Creates a Shepherd.js Tour instance with shared base configuration.
// Used by useOnboardingTour and useCreateSectionTour.
export const createShepherdTour = ({
  stepClass,
  additionalStepOptions,
}: CreateShepherdTourOptions): Tour => {
  const tour = new Shepherd.Tour({
    useModalOverlay: false,
    exitOnEsc: true,
    keyboardNavigation: true,
    defaultStepOptions: {
      cancelIcon: {enabled: true},
      scrollTo: true,
      scrollToHandler: scrollIntoViewIfNeeded,
      classes: stepClass,
      floatingUIOptions: {
        middleware: [offset(16)],
      },
      modalOverlayOpeningPadding: 4,
      ...(additionalStepOptions ?? {}),
    },
  });

  // Cancel the tour if its anchor element is removed from the DOM without a
  // full page reload (e.g. SPA navigation via TeacherNavigationRouter).
  // This runs on every tour created here, including the resume-path tours
  // that bypass useOnboardingTour and call createShepherdTour directly.
  let anchorObserver: MutationObserver | null = null;

  const stopWatchingAnchor = () => {
    if (anchorObserver) {
      anchorObserver.disconnect();
      anchorObserver = null;
    }
  };

  tour.on('show', () => {
    stopWatchingAnchor();
    const step = tour.currentStep;
    if (!step) return;

    const attachTo = step.options.attachTo;
    const selector =
      attachTo && typeof attachTo === 'object' ? attachTo.element : null;

    if (!selector) return;

    const anchor = document.querySelector(selector as string);
    if (!anchor) return;

    anchorObserver = new MutationObserver(() => {
      if (!document.body.contains(anchor)) {
        stopWatchingAnchor();
        tour.cancel();
      }
    });
    anchorObserver.observe(document.body, {childList: true, subtree: true});

    // When a step's click handler calls step.hide() to hand off to the next
    // page (without advancing via tour.next()), the tour's 'show' event never
    // fires again, so stopWatchingAnchor() would not be called. The observer
    // would then fire during the SPA navigation DOM teardown and call
    // tour.cancel(), wiping sessionStorage before the resume function reads it.
    // Disconnecting on step hide prevents this.
    const onStepHide = () => {
      stopWatchingAnchor();
      step.off('hide', onStepHide);
    };
    step.on('hide', onStepHide);
  });

  tour.on('complete', stopWatchingAnchor);
  tour.on('cancel', stopWatchingAnchor);

  return tour;
};
