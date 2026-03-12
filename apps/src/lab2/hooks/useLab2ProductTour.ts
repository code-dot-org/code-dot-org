import {Tour, StepOptions} from 'shepherd.js';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

interface UseLab2ProductTourProps {
  getSteps: (tour: Tour) => StepOptions[];
  localStorageKey: string;
  tourAvailable: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: (currentStepIndex: number) => void;
}

// Wrapper around useProductTour that enforces common restrictions for Lab2 tours,
// currently just preventing tours from rendering in start mode.
const useLab2ProductTour = ({
  tourAvailable,
  ...useProductTourProps
}: UseLab2ProductTourProps) => {
  return useProductTour({
    tourAvailable: tourAvailable && !isStartMode,
    ...useProductTourProps,
  });
};

export default useLab2ProductTour;
