import {renderHook} from '@testing-library/react-hooks';

import {useLessonDeepDiveChallengesEnabled} from '@cdo/apps/aiTutor/hooks/useLessonDeepDiveChallengesEnabled';
import experiments from '@cdo/apps/util/experiments';

const mockCurrentUser = {canUseLessonDeepDiveChallenges: true};
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (selector: (state: object) => unknown) =>
    selector({currentUser: mockCurrentUser}),
}));

describe('useLessonDeepDiveChallengesEnabled', () => {
  beforeEach(() => {
    mockCurrentUser.canUseLessonDeepDiveChallenges = true;
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, true);
  });

  afterEach(() => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
  });

  it('is true with challenge access and the experiment on', () => {
    const {result} = renderHook(() => useLessonDeepDiveChallengesEnabled());
    expect(result.current).toBe(true);
  });

  it('is false without challenge access', () => {
    mockCurrentUser.canUseLessonDeepDiveChallenges = false;
    const {result} = renderHook(() => useLessonDeepDiveChallengesEnabled());
    expect(result.current).toBe(false);
  });

  it('is false when the lesson-tutor-challenge experiment is off', () => {
    experiments.setEnabled(experiments.LESSON_TUTOR_CHALLENGE, false);
    const {result} = renderHook(() => useLessonDeepDiveChallengesEnabled());
    expect(result.current).toBe(false);
  });
});
