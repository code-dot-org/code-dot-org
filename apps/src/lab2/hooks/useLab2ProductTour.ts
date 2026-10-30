import {
  getAppOptionsEditingExemplar,
  getIsStartMode,
} from '@cdo/apps/lab2/projects/utils';
import {isPermanentlyReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import useProductTour, {
  UseProductTourProps,
} from '@cdo/apps/sharedComponents/productTour/useProductTour';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import useHideTourOnTourChange from './useHideTourOnTourChange';

// Wrapper around useProductTour that enforces common restrictions for Lab2 tours.
const useLab2ProductTour = ({
  tourAvailable,
  ...useProductTourProps
}: UseProductTourProps) => {
  const isStartMode = getIsStartMode();
  const editingExemplar = !!getAppOptionsEditingExemplar();
  const isPermanentlyReadOnly = useAppSelector(isPermanentlyReadOnlyWorkspace);
  const hideTour = isStartMode || editingExemplar || isPermanentlyReadOnly;
  const {tour} = useProductTour({
    tourAvailable: tourAvailable && !hideTour,
    ...useProductTourProps,
  });

  useHideTourOnTourChange(tour);
  return {tour};
};

export default useLab2ProductTour;
