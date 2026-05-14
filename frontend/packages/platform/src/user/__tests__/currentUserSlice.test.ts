import {configureStore} from '@reduxjs/toolkit';
import {beforeEach, describe, expect, it, vi} from 'vitest';

// Stub the analytics + experiments deps that the slice imports for the
// `setUser` side effect, so the test doesn't pull the singleton through.
const setUser = vi.fn();
vi.mock('@code-dot-org/core/plugins/analytics', () => ({
  setUser: (...args: unknown[]) => setUser(...args),
}));
vi.mock('@code-dot-org/core/gates', () => ({
  experiments: {
    getEnabledExperiments: () => ['exp_a', 'exp_b'],
  },
}));

import currentUserSlice, {
  setInitialData,
  type CurrentUserDefinition,
} from '../redux/currentUserSlice';
import {UserTypes} from '../constants';

function makeStore() {
  return configureStore({reducer: {currentUser: currentUserSlice.reducer}});
}

const baseInput: CurrentUserDefinition = {
  userId: 17,
  uuid: 'abc-123',
  userName: 'sam',
  displayName: 'Sam S.',
  userType: UserTypes.Student,
  educatorRole: '',
  isVerifiedInstructor: false,
  isBackgroundMusicMuted: true,
  isSortedByFamilyName: false,
  under13: true,
  over21: false,
  age: 10,
  countryCode: 'US',
  usStateCode: 'WA',
  userSharingDisabled: false,
  showProgressTableV2: true,
  progressTableV2ClosedBeta: false,
  hasSeenProgressTableInvite: false,
  hasCompletedAiDifferentiationWelcome: false,
};

describe('currentUserSlice setInitialData', () => {
  beforeEach(() => {
    setUser.mockClear();
  });

  it('copies overlapping fields straight through to state', () => {
    const store = makeStore();
    store.dispatch(setInitialData(baseInput));
    const state = store.getState().currentUser;

    // Spot-check the rename-free copies. The exhaustive list isn't useful;
    // the goal is to guard the Object.assign path against accidental
    // rename or omission.
    expect(state.userId).toBe(17);
    expect(state.uuid).toBe('abc-123');
    expect(state.userName).toBe('sam');
    expect(state.displayName).toBe('Sam S.');
    expect(state.userType).toBe(UserTypes.Student);
    expect(state.isBackgroundMusicMuted).toBe(true);
    expect(state.under13).toBe(true);
    expect(state.age).toBe(10);
    expect(state.countryCode).toBe('US');
    expect(state.usStateCode).toBe('WA');
  });

  it('derives isTeacher=true when userType is Teacher', () => {
    const store = makeStore();
    store.dispatch(setInitialData({...baseInput, userType: UserTypes.Teacher}));
    expect(store.getState().currentUser.isTeacher).toBe(true);
  });

  it('derives isTeacher=false for any non-Teacher userType', () => {
    const store = makeStore();
    store.dispatch(setInitialData({...baseInput, userType: UserTypes.Student}));
    expect(store.getState().currentUser.isTeacher).toBe(false);
  });

  it('derives inUSA=true for country codes US and RD', () => {
    const store = makeStore();
    store.dispatch(setInitialData({...baseInput, countryCode: 'US'}));
    expect(store.getState().currentUser.inUSA).toBe(true);

    store.dispatch(setInitialData({...baseInput, countryCode: 'RD'}));
    expect(store.getState().currentUser.inUSA).toBe(true);
  });

  it('derives inUSA=false for non-US country codes and when missing', () => {
    const store = makeStore();
    store.dispatch(setInitialData({...baseInput, countryCode: 'CA'}));
    expect(store.getState().currentUser.inUSA).toBe(false);

    const {countryCode: _drop, ...withoutCountry} = baseInput;
    store.dispatch(setInitialData(withoutCountry));
    expect(store.getState().currentUser.inUSA).toBe(false);
  });

  it('does not store the side-effect-only fields in state', () => {
    const store = makeStore();
    store.dispatch(
      setInitialData({
        ...baseInput,
        educatorRole: 'lead_facilitator',
        isVerifiedInstructor: true,
      }),
    );
    const state = store.getState().currentUser as Record<string, unknown>;
    // These exist only on CurrentUserDefinition, not on CurrentUserState.
    expect(state.educatorRole).toBeUndefined();
    expect(state.isVerifiedInstructor).toBeUndefined();
  });

  it('forwards identity + experiments to analytics setUser', () => {
    const store = makeStore();
    store.dispatch(
      setInitialData({
        ...baseInput,
        userId: 42,
        userType: UserTypes.Teacher,
        educatorRole: 'classroom_teacher',
        isVerifiedInstructor: true,
      }),
    );

    expect(setUser).toHaveBeenCalledTimes(1);
    expect(setUser).toHaveBeenCalledWith({
      userId: '42',
      userType: UserTypes.Teacher,
      isVerifiedInstructor: true,
      enabledExperiments: ['exp_a', 'exp_b'],
      educatorRole: 'classroom_teacher',
    });
  });

  it('coerces a missing userId to "0" for the analytics call', () => {
    const store = makeStore();
    const {userId: _drop, ...withoutId} = baseInput;
    store.dispatch(setInitialData(withoutId));
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({userId: '0'}),
    );
  });

  it('coerces a missing userType to "" for the analytics call', () => {
    const store = makeStore();
    const {userType: _drop, ...withoutType} = baseInput;
    store.dispatch(setInitialData(withoutType));
    expect(setUser).toHaveBeenCalledWith(
      expect.objectContaining({userType: ''}),
    );
  });
});
