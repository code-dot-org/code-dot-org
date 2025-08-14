import {createSlice} from "@reduxjs/toolkit";
import type {PayloadAction} from "@reduxjs/toolkit";

import {analyticsReporter, experiments} from '@code-dot-org/metrics';

import {UserType, CourseRoles, SignInState} from '../types';

export interface CurrentUserDefinition {
  id?: number;
  uuid?: string;
  username?: string;
  user_type?: UserType;
  display_name?: string;
  educator_role: string;
  ai_rubrics_disabled?: boolean;
  ai_differentiation_enabled?: boolean;
  mute_music: boolean;
  sort_by_family_name: boolean;
  is_lti?: boolean;
  is_verified_instructor: boolean;
  under_13: boolean;
  over_21: boolean;
  child_account_compliance_state?: string;
  country_code?: string;
  us_state_code?: string;
  in_section?: boolean;
  created_at?: number;
  sharing_disabled: boolean;
  show_progress_table_v2: boolean;
  progress_table_v2_closed_beta: boolean;
  date_progress_table_invitation_last_delayed?: number;
  has_seen_progress_table_v2_invitation: boolean;
  has_completed_ai_differentiation_welcome: boolean;
  age: number;
}

export interface CurrentUserState {
  userId?: number;
  uuid?: string;
  userName?: string;
  userType?: UserType;
  displayName?: string;
  userRoleInCourse: CourseRoles;
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
  userType: UserType.Unknown,
  userRoleInCourse: CourseRoles.Unknown,
  signInState: SignInState.Unknown,
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
    setCurrentUserHasSeenStandardsReportInfo: (state, action: PayloadAction<boolean>) => {
      state.hasSeenStandardsReportInfo = action.payload;
    },
    setUserSignedIn: (state, action: PayloadAction<boolean>) => {
      state.signInState = action.payload ? SignInState.SignedIn : SignInState.SignedOut;
    },
    setUserType: (state, action: PayloadAction<{
      userType: UserType;
      under13: boolean;
    }>) => {
      state.userType = action.payload.userType;
      state.under13 = action.payload.under13;
    },
    setOver21: (state, action: PayloadAction<boolean>) => {
      state.over21 = action.payload;
    },
    setUserRoleInCourse: (state, action: PayloadAction<CourseRoles>) => {
      state.userRoleInCourse = action.payload;
    },
    setInitialData: (state, action: PayloadAction<CurrentUserDefinition>) => {
      const {
        id,
        uuid,
        username,
        display_name,
        user_type,
        mute_music,
        under_13,
        over_21,
        sort_by_family_name,
        show_progress_table_v2,
        ai_rubrics_disabled,
        ai_differentiation_enabled,
        progress_table_v2_closed_beta,
        is_lti,
        date_progress_table_invitation_last_delayed,
        has_seen_progress_table_v2_invitation,
        child_account_compliance_state,
        country_code,
        us_state_code,
        age,
        in_section,
        created_at,
        is_verified_instructor,
        has_completed_ai_differentiation_welcome,
        educator_role,
        sharing_disabled,
      } = action.payload;

      analyticsReporter.setUserProperties({
        userId: (id || 0).toString(),
        userType: user_type || '',
        isVerifiedInstructor: is_verified_instructor,
        enabledExperiments: experiments.getEnabledExperiments(),
        educatorRole: educator_role || '',
      });

      state.userId = id;
      state.uuid = uuid;
      state.userName = username;
      state.userType = user_type;
      state.displayName = display_name; 
      state.isBackgroundMusicMuted = mute_music;
      state.under13 = under_13;
      state.over21 = over_21;
      state.isSortedByFamilyName = sort_by_family_name;
      state.showProgressTableV2 = show_progress_table_v2;
      state.aiRubricsDisabled = ai_rubrics_disabled;
      state.aiDifferentiationEnabled = ai_differentiation_enabled;
      state.progressTableV2ClosedBeta = progress_table_v2_closed_beta;
      state.isLti = is_lti;
      state.isTeacher = user_type === UserType.Teacher;
      state.inUSA = ['US', 'RD'].includes(country_code || '');
      state.dateProgressTableInvitationDelayed = date_progress_table_invitation_last_delayed;
      state.hasSeenProgressTableInvite = has_seen_progress_table_v2_invitation;
      state.hasCompletedAiDifferentiationWelcome = has_completed_ai_differentiation_welcome;
      state.childAccountComplianceState = child_account_compliance_state;
      state.countryCode = country_code;
      state.usStateCode = us_state_code;
      state.age = age;
      state.inSection = in_section;
      state.userCreatedAt = created_at;
      state.userSharingDisabled = sharing_disabled;
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
    setDateProgressTableInvitationDelayed: (state, action: PayloadAction<number>) => {
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

export const isSignedIn: (currentUserState: CurrentUserState) => boolean = currentUserState => {
  return currentUserState.signInState === SignInState.SignedIn;
};

export default currentUserSlice;
