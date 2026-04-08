import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';

import {createSectionOnboardingTourSteps} from './createSectionOnboarding';

const useTeacherHomepageTour = (isElementaryTeacher: boolean) => {
  const {tour} = useOnboardingTour({
    getSteps: tour =>
      createSectionOnboardingTourSteps(tour, isElementaryTeacher),
  });

  return tour;
};

export default useTeacherHomepageTour;
