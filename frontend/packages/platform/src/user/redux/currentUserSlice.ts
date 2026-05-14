import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

import {setUser} from '@code-dot-org/core/plugins/analytics';
import {experiments} from '@code-dot-org/core/gates';

import {UserTypes, CourseRoles, SignInStates} from '../constants';
import type {UserType, CourseRole, SignInState} from '../types';

/**
 * Payload accepted by `setInitialData`. Field names match `CurrentUserState`
 * where they overlap; consumers are responsible for converting whatever the
 * upstream source uses (Rails snake_case, Devise JSON, etc.) before
 * dispatching. `educatorRole` and `isVerifiedInstructor` are not stored in
 * state — they're forwarded to the analytics `setUser` call only.
 */
export interface CurrentUserDefinition {
  userId?: number;
  uuid?: string;
  userName?: string;
  userType?: UserType;
  displayName?: string;
  educatorRole: string;
  aiRubricsDisabled?: boolean;
  aiDifferentiationEnabled?: boolean;
  isBackgroundMusicMuted: boolean;
  isSortedByFamilyName: boolean;
  isLti?: boolean;
  isVerifiedInstructor: boolean;
  under13: boolean;
  over21: boolean;
  childAccountComplianceState?: string;
  countryCode?: string;
  usStateCode?: string;
  inSection?: boolean;
  userCreatedAt?: number;
  userSharingDisabled: boolean;
  showProgressTableV2: boolean;
  progressTableV2ClosedBeta: boolean;
  dateProgressTableInvitationDelayed?: number;
  hasSeenProgressTableInvite: boolean;
  hasCompletedAiDifferentiationWelcome: boolean;
  age: number;
}

export interface CurrentUserState {
  userId?: number;
  uuid?: string;
  userName?: string;
  userType?: UserType;
  displayName?: string;
  userRoleInCourse: CourseRole;
  signInState: SignInState;
  hasSeenStandardsReportInfo: boolean;
  aiRubricsDisabled?: boolean;
  aiDifferentiationEnabled?: boolean;
  isBackgroundMusicMuted: boolean;
  isSortedByFamilyName: boolean;
  isLti?: boolean;
  isTeacher?: boolean;
  under13: boolean;
  over21: boolean;
  childAccountComplianceState?: string;
  inUSA: boolean;
  countryCode?: string;
  usStateCode?: string;
  inSection?: boolean;
  userCreatedAt?: number;
  userSharingDisabled: boolean;
  showProgressTableV2: boolean;
  progressTableV2ClosedBeta: boolean;
  dateProgressTableInvitationDelayed?: number;
  hasSeenProgressTableInvite: boolean;
  hasCompletedAiDifferentiationWelcome: boolean;
  age: number;
}

const initialState: CurrentUserState = {
  userType: UserTypes.Unknown,
  userRoleInCourse: CourseRoles.Unknown,
  signInState: SignInStates.Unknown,
  hasSeenStandardsReportInfo: false,
  isBackgroundMusicMuted: false,
  isSortedByFamilyName: false,
  // Setting default under13 value to true to err on the side of caution for age-restricted content.
  under13: true,
  over21: false,
  age: 6,
  inUSA: false,
  userSharingDisabled: false,
  showProgressTableV2: true,
  progressTableV2ClosedBeta: false,
  hasSeenProgressTableInvite: false,
  hasCompletedAiDifferentiationWelcome: false,
};

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setCurrentUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    setCurrentUserHasSeenStandardsReportInfo: (
      state,
      action: PayloadAction<boolean>,
    ) => {
      state.hasSeenStandardsReportInfo = action.payload;
    },
    setUserSignedIn: (state, action: PayloadAction<boolean>) => {
      state.signInState = action.payload
        ? SignInStates.SignedIn
        : SignInStates.SignedOut;
    },
    setUserType: (
      state,
      action: PayloadAction<{
        userType: UserType;
        under13: boolean;
      }>,
    ) => {
      state.userType = action.payload.userType;
      state.under13 = action.payload.under13;
    },
    setOver21: (state, action: PayloadAction<boolean>) => {
      state.over21 = action.payload;
    },
    setUserRoleInCourse: (state, action: PayloadAction<CourseRole>) => {
      state.userRoleInCourse = action.payload;
    },
    setInitialData: (state, action: PayloadAction<CurrentUserDefinition>) => {
      // `educatorRole` and `isVerifiedInstructor` are forwarded to the
      // analytics `setUser` call only — they aren't stored in slice state.
      const {educatorRole, isVerifiedInstructor, ...patch} = action.payload;

      void setUser({
        userId: (patch.userId || 0).toString(),
        userType: patch.userType || '',
        isVerifiedInstructor,
        enabledExperiments: experiments.getEnabledExperiments(),
        educatorRole: educatorRole || '',
      });

      Object.assign(state, patch);
      state.isTeacher = patch.userType === UserTypes.Teacher;
      state.inUSA = ['US', 'RD'].includes(patch.countryCode || '');
    },
    setMuteMusic: (state, action: PayloadAction<boolean>) => {
      state.isBackgroundMusicMuted = action.payload;
    },
    setSortByFamilyName: (state, action: PayloadAction<boolean>) => {
      state.isSortedByFamilyName = action.payload;
    },
    setShowProgressTableV2: (state, action: PayloadAction<boolean>) => {
      state.showProgressTableV2 = action.payload;
    },
    setProgressTableV2ClosedBeta: (state, action: PayloadAction<boolean>) => {
      state.progressTableV2ClosedBeta = action.payload;
    },
    setDateProgressTableInvitationDelayed: (
      state,
      action: PayloadAction<number>,
    ) => {
      state.dateProgressTableInvitationDelayed = action.payload;
    },
    setSeenProgressTableInvitation: (state, action: PayloadAction<boolean>) => {
      state.hasSeenProgressTableInvite = action.payload;
    },
    setAiRubricsDisabled: (state, action: PayloadAction<boolean>) => {
      state.aiRubricsDisabled = action.payload;
    },
    setAiDifferentiationEnabled: (state, action: PayloadAction<boolean>) => {
      state.aiDifferentiationEnabled = action.payload;
    },
    setUserCreatedAt: (state, action: PayloadAction<number>) => {
      state.userCreatedAt = action.payload;
    },
  },
});

export const {
  setCurrentUserName,
  setCurrentUserHasSeenStandardsReportInfo,
  setUserSignedIn,
  setUserType,
  setOver21,
  setInitialData,
  setMuteMusic,
  setSortByFamilyName,
  setShowProgressTableV2,
  setProgressTableV2ClosedBeta,
  setDateProgressTableInvitationDelayed,
  setSeenProgressTableInvitation,
  setAiRubricsDisabled,
  setAiDifferentiationEnabled,
  setUserCreatedAt,
  setUserRoleInCourse,
} = currentUserSlice.actions;

export const isSignedIn: (
  currentUserState: CurrentUserState,
) => boolean = currentUserState => {
  return currentUserState.signInState === SignInStates.SignedIn;
};

export default currentUserSlice;
