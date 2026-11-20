import {useEffect, useState} from 'react';
import Shepherd from 'shepherd.js';

import {scrollIntoViewIfNeeded} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';

import {authoredStepOptions} from '../authoredTourSteps';
import {tourAnchorSelector} from '../tourAnchors';
import {AuthoredTourStep} from '../types';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

const PREVIEW_DELAY_MS = 150;
const TARGET_CHECK_MS = 500;

// Shepherd focuses a step when it opens and the previously focused element
// when it closes. The author is typing in the editor, so focus stays there.
const keepingFocus = (action: () => void) => {
  const focused = document.activeElement;
  action();
  if (focused instanceof HTMLElement && document.activeElement !== focused) {
    focused.focus({preventScroll: true});
  }
};

interface UseStepPreviewParams {
  step: AuthoredTourStep | undefined;
  index: number;
  stepCount: number;
  appName: string | undefined;
  enabled: boolean;
}

// Shows the step being edited on the lab as a student will see it, without
// the dimmed backdrop, so the author can keep using the lab and the editor.
// Returns whether the step's target is missing from the page.
const useStepPreview = ({
  step,
  index,
  stepCount,
  appName,
  enabled,
}: UseStepPreviewParams) => {
  const selector = step?.anchor
    ? tourAnchorSelector(appName, step.anchor)
    : undefined;
  const [targetMissing, setTargetMissing] = useState(false);

  // The target comes and goes as the author uses the lab.
  useEffect(() => {
    if (!selector) {
      setTargetMissing(false);
      return;
    }
    const check = () => setTargetMissing(!document.querySelector(selector));
    check();
    const interval = setInterval(check, TARGET_CHECK_MS);
    return () => clearInterval(interval);
  }, [selector]);

  // The step is a new object on every edit; its contents decide a redraw.
  const stepJson = step ? JSON.stringify(step) : undefined;

  useEffect(() => {
    if (!enabled || !stepJson || targetMissing) {
      return;
    }
    let tour: InstanceType<typeof Shepherd.Tour> | undefined;
    const timer = setTimeout(() => {
      tour = new Shepherd.Tour({
        useModalOverlay: false,
        exitOnEsc: false,
        keyboardNavigation: false,
        defaultStepOptions: {
          cancelIcon: {enabled: true},
          scrollTo: true,
          scrollToHandler: scrollIntoViewIfNeeded,
          classes: 'custom-shepherd-step-container',
        },
      });
      tour.addStep(
        authoredStepOptions({
          tour,
          step: JSON.parse(stepJson),
          index,
          stepCount,
          appName,
          preview: true,
        })
      );
      const startedTour = tour;
      keepingFocus(() => startedTour.start());
      // Shepherd focuses the step again each time it repositions it.
      const element = startedTour.getCurrentStep()?.getElement();
      if (element) {
        element.focus = () => {};
      }
    }, PREVIEW_DELAY_MS);

    return () => {
      clearTimeout(timer);
      if (tour?.isActive()) {
        const activeTour = tour;
        keepingFocus(() => activeTour.cancel());
      }
    };
  }, [enabled, stepJson, targetMissing, index, stepCount, appName]);

  return {targetMissing};
};

export default useStepPreview;
