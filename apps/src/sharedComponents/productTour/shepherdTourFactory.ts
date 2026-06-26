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
  return new Shepherd.Tour({
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
};
