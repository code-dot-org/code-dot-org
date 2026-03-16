import {
  getAppOptionsViewingExemplar,
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import useProductTour, {
  UseProductTourProps,
} from '@cdo/apps/sharedComponents/productTour/useProductTour';

// Wrapper around useProductTour that enforces common restrictions for Lab2 tours.
const useLab2ProductTour = ({
  tourAvailable,
  ...useProductTourProps
}: UseProductTourProps) => {
  const isStartMode = getIsStartMode();
  const viewingExemplar = !!getAppOptionsViewingExemplar();
  const editingExemplar = !!getAppOptionsEditingExemplar();
  const hideTour = isStartMode || viewingExemplar || editingExemplar;
  return useProductTour({
    tourAvailable: tourAvailable && !hideTour,
    ...useProductTourProps,
  });
};

export default useLab2ProductTour;
