import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import useProductTour, {
  UseProductTourProps,
} from '@cdo/apps/sharedComponents/productTour/useProductTour';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;

// Wrapper around useProductTour that enforces common restrictions for Lab2 tours,
// currently just preventing tours from rendering in start mode.
const useLab2ProductTour = ({
  tourAvailable,
  ...useProductTourProps
}: UseProductTourProps) => {
  return useProductTour({
    tourAvailable: tourAvailable && !isStartMode,
    ...useProductTourProps,
  });
};

export default useLab2ProductTour;
