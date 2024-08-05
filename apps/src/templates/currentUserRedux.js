import statsigReporter from '@cdo/apps/metrics/StatsigReporter';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReport from '@cdo/apps/metrics/utils/AnalyticsReporter';
import experiments from '@cdo/apps/util/experiments';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {makeEnum} from '../utils';

const SET_CURRENT_USER_NAME = 'currentUser/SET_CURRENT_USER_NAME';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';
const SET_OVER_21 = 'currentUser/SET_OVER_21';
const SET_USER_ROLE_IN_COURSE = 'currentUser/SET_USER_ROLE_IN_COURSE';
const SET_HAS_SEEN_STANDARDS_REPORT =
  'currentUser/SET_HAS_SEEN_STANDARDS_REPORT';
const SET_INITIAL_DATA = 'currentUser/SET_INITIAL_DATA';
const SET_MUTE_MUSIC = 'currentUser/SET_MUTE_MUSIC';
const SET_SORT_BY_FAMILY_NAME = 'currentUser/SET_SORT_BY_FAMILY_NAME';
const SET_SHOW_PROGRESS_TABLE_V2 = 'currentUser/SET_SHOW_PROGRESS_TABLE_V2';
const SET_AI_RUBRICS_DISABLED = 'currentUser/SET_AI_RUBRICS_DISABLED';
const SET_PROGRESS_TABLE_V2_CLOSED_BETA =
  'currentUser/SET_PROGRESS_TABLE_V2_CLOSED_BETA';
const SET_DATE_PROGRESS_TABLE_INVITATION_LAST_DELAYED =
  'currentUser/SET_DATE_PROGRESS_TABLE_INVITATION_LAST_DELAYED';
const SET_SEEN_PROGRESS_TABLE_INVITATION =
  'currentUser/SET_SEEN_PROGRESS_TABLE_INVITATION';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

export const CourseRoles = makeEnum('Unknown', 'Instructor', 'Participant');

// Action creators
export const setCurrentUserName = userName => ({
  type: SET_CURRENT_USER_NAME,
  userName,
});
export const setCurrentUserHasSeenStandardsReportInfo =
  hasSeenStandardsReport => ({
    type: SET_HAS_SEEN_STANDARDS_REPORT,
    hasSeenStandardsReport,
  });
export const setUserSignedIn = isSignedIn => ({
  type: SET_USER_SIGNED_IN,
  isSignedIn,
});
export const setUserType = (userType, under13) => ({
  type: SET_USER_TYPE,
  userType,
  under13,
});
export const setOver21 = over21 => ({
  type: SET_OVER_21,
  over21,
});
export const setUserRoleInCourse = userRoleInCourse => ({
  type: SET_USER_ROLE_IN_COURSE,
  userRoleInCourse,
});
export const setInitialData = serverUser => ({
  type: SET_INITIAL_DATA,
  serverUser,
});
export const setMuteMusic = isBackgroundMusicMuted => ({
  type: SET_MUTE_MUSIC,
  isBackgroundMusicMuted,
});
export const setSortByFamilyName = (
  isSortedByFamilyName,
  sectionId,
  unitName,
  source
) => ({
  type: SET_SORT_BY_FAMILY_NAME,
  isSortedByFamilyName,
  sectionId,
  unitName,
  source,
});
export const setShowProgressTableV2 = showProgressTableV2 => ({
  type: SET_SHOW_PROGRESS_TABLE_V2,
  showProgressTableV2,
});
export const setProgressTableV2ClosedBeta = progressTableV2ClosedBeta => ({
  type: SET_PROGRESS_TABLE_V2_CLOSED_BETA,
  progressTableV2ClosedBeta,
});
export const setHasSeenProgressTableInvite = hasSeenProgressTableInvite => ({
  type: SET_SEEN_PROGRESS_TABLE_INVITATION,
  hasSeenProgressTableInvite,
});
export const setDateProgressTableInvitationDelayed =
  dateProgressTableInvitationDelayed => ({
    type: SET_DATE_PROGRESS_TABLE_INVITATION_LAST_DELAYED,
    dateProgressTableInvitationDelayed,
  });
export const setAiRubricsDisabled = aiRubricsDisabled => ({
  type: SET_AI_RUBRICS_DISABLED,
  aiRubricsDisabled,
});

const initialState = {
  userId: null,
  uuid: null,
  userName: null,
  userType: 'unknown',
  userRoleInCourse: CourseRoles.Unknown,
  signInState: SignInState.Unknown,
  hasSeenStandardsReportInfo: false,
  isBackgroundMusicMuted: false,
  isSortedByFamilyName: false,
  isLti: undefined,
  isTeacher: undefined,
  // Setting default under13 value to true to err on the side of caution for age-restricted content.
  under13: true,
  over21: false,
  childAccountComplianceState: null,
  countryCode: null,
  usStateCode: null,
  inSection: null,
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_NAME) {
    return {
      ...state,
      userName: action.userName,
    };
  }
  if (action.type === SET_HAS_SEEN_STANDARDS_REPORT) {
    return {
      ...state,
      hasSeenStandardsReportInfo: action.hasSeenStandardsReport,
    };
  }
  if (action.type === SET_USER_SIGNED_IN) {
    return {
      ...state,
      signInState: action.isSignedIn
        ? SignInState.SignedIn
        : SignInState.SignedOut,
    };
  }
  if (action.type === SET_USER_TYPE) {
    return {
      ...state,
      userType: action.userType,
      under13: action.under13,
    };
  }
  if (action.type === SET_OVER_21) {
    return {
      ...state,
      over21: action.over21,
    };
  }
  if (action.type === SET_USER_ROLE_IN_COURSE) {
    return {
      ...state,
      userRoleInCourse: action.userRoleInCourse,
    };
  }
  if (action.type === SET_MUTE_MUSIC) {
    return {
      ...state,
      isBackgroundMusicMuted: action.isBackgroundMusicMuted,
    };
  }
  if (action.type === SET_SORT_BY_FAMILY_NAME) {
    if (action.isSortedByFamilyName) {
      analyticsReport.sendEvent(EVENTS.SORT_BY_FAMILY_NAME, {
        sectionId: action.sectionId,
        unitName: action.unitName,
        source: action.source,
      });
    } else {
      analyticsReport.sendEvent(EVENTS.SORT_BY_DISPLAY_NAME, {
        sectionId: action.sectionId,
        unitName: action.unitName,
        source: action.source,
      });
    }
    return {
      ...state,
      isSortedByFamilyName: action.isSortedByFamilyName,
    };
  }
  if (action.type === SET_SHOW_PROGRESS_TABLE_V2) {
    return {
      ...state,
      showProgressTableV2: action.showProgressTableV2,
    };
  }
  if (action.type === SET_PROGRESS_TABLE_V2_CLOSED_BETA) {
    return {
      ...state,
      progressTableV2ClosedBeta: action.progressTableV2ClosedBeta,
    };
  }
  if (action.type === SET_DATE_PROGRESS_TABLE_INVITATION_LAST_DELAYED) {
    return {
      ...state,
      dateProgressTableInvitationDelayed:
        action.dateProgressTableInvitationDelayed,
    };
  }
  if (action.type === SET_SEEN_PROGRESS_TABLE_INVITATION) {
    return {
      ...state,
      hasSeenProgressTableInvite: action.hasSeenProgressTableInvite,
    };
  }
  if (action.type === SET_AI_RUBRICS_DISABLED) {
    return {
      ...state,
      aiRubricsDisabled: action.aiRubricsDisabled,
    };
  }

  if (action.type === SET_INITIAL_DATA) {
    const {
      id,
      uuid,
      username,
      user_type,
      mute_music,
      under_13,
      over_21,
      sort_by_family_name,
      show_progress_table_v2,
      ai_rubrics_disabled,
      progress_table_v2_closed_beta,
      is_lti,
      date_progress_table_invitation_last_delayed,
      has_seen_progress_table_v2_invitation,
      child_account_compliance_state,
      country_code,
      us_state_code,
      in_section,
    } = action.serverUser;
    analyticsReport.setUserProperties(
      id,
      user_type,
      experiments.getEnabledExperiments()
    );
    // Calling Statsig separately to emphasize different user integrations
    // and because dual reporting is aspirationally temporary (March 2024)
    statsigReporter.setUserProperties(
      id,
      user_type,
      experiments.getEnabledExperiments()
    );
    return {
      ...state,
      userId: id,
      uuid: uuid,
      userName: username,
      userType: user_type,
      isBackgroundMusicMuted: mute_music,
      under13: under_13,
      over21: over_21,
      isSortedByFamilyName: sort_by_family_name,
      showProgressTableV2: show_progress_table_v2,
      aiRubricsDisabled: ai_rubrics_disabled,
      progressTableV2ClosedBeta: progress_table_v2_closed_beta,
      isLti: is_lti,
      isTeacher: user_type === UserTypes.TEACHER,
      dateProgressTableInvitationDelayed:
        date_progress_table_invitation_last_delayed,
      hasSeenProgressTableInvite: has_seen_progress_table_v2_invitation,
      childAccountComplianceState: child_account_compliance_state,
      countryCode: country_code,
      usStateCode: us_state_code,
      inSection: in_section,
    };
  }

  return state;
}

export const isSignedIn = currentUserState => {
  return currentUserState.signInState === SignInState.SignedIn;
};
