import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import useProductTour, {
  UseProductTourProps,
} from '@cdo/apps/sharedComponents/productTour/useProductTour';

// Wrapper around useProductTour that enforces common restrictions for Lab2 tours,
// currently just preventing tours from rendering in start mode.
const useLab2ProductTour = ({
  tourAvailable,
  ...useProductTourProps
}: UseProductTourProps) => {
  const isStartMode = getIsStartMode();
  return useProductTour({
    tourAvailable: tourAvailable && !isStartMode,
    ...useProductTourProps,
  });
};

export default useLab2ProductTour;
