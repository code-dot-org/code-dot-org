import Shepherd, {StepOptions, Tour} from 'shepherd.js';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

interface CreateShepherdTourOptions {
  stepClass: string;
  additionalStepOptions?: Partial<StepOptions>;
}

// Creates a Shepherd.js Tour instance with shared base configuration.
// Used by both useProductTour and useOnboardingTour.
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
      classes: stepClass,
      modalOverlayOpeningPadding: 4,
      ...(additionalStepOptions ?? {}),
    },
  });
};
