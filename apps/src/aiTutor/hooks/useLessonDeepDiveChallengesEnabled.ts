import experiments from '@cdo/apps/util/experiments';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export const useLessonDeepDiveChallengesEnabled = (): boolean => {
  const canUseChallenges = useAppSelector(
    state => state.currentUser.canUseLessonDeepDiveChallenges
  );
  return (
    canUseChallenges &&
    experiments.isEnabledAllowingQueryString(experiments.LESSON_TUTOR_CHALLENGE)
  );
};
