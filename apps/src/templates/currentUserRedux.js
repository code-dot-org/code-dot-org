import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReport from '@cdo/apps/metrics/AnalyticsReporter';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';
import experiments from '@cdo/apps/util/experiments';
import {UserTypes} from '@cdo/generated-scripts/sharedConstants';

import {makeEnum} from '../utils';

const SET_CURRENT_USER_NAME = 'currentUser/SET_CURRENT_USER_NAME';
const SET_USER_SIGNED_IN = 'currentUser/SET_USER_SIGNED_IN';
const SET_USER_TYPE = 'currentUser/SET_USER_TYPE';
const SET_OVER_21 = 'currentUser/SET_OVER_21';
const SET_USER_ROLE_IN_COURSE = 'currentUser/SET_USER_ROLE_IN_COURSE';
const SET_INITIAL_DATA = 'currentUser/SET_INITIAL_DATA';
const SET_MUTE_MUSIC = 'currentUser/SET_MUTE_MUSIC';
const SET_SORT_BY_FAMILY_NAME = 'currentUser/SET_SORT_BY_FAMILY_NAME';
const SET_HAS_SEEN_HOMEPAGE_WELCOME =
  'currentUser/SET_HAS_SEEN_HOMEPAGE_WELCOME';
const SET_AI_RUBRICS_DISABLED = 'currentUser/SET_AI_RUBRICS_DISABLED';
const SET_AI_DIFFERENTIATION_ENABLED =
  'currentUser/SET_AI_DIFFERENTIATION_ENABLED';
const SET_SHOW_AI_TA_LESSON_SUMMARY =
  'currentUser/SET_SHOW_AI_TA_LESSON_SUMMARY';
const SET_SHOW_AI_TA_PODCASTS = 'currentUser/SET_SHOW_AI_TA_PODCASTS';
const SET_HAS_COMPLETED_PERSONALIZATION_QUIZ =
  'currentUser/SET_HAS_COMPLETED_PERSONALIZATION_QUIZ';
const SET_USER_CREATED_AT = 'currentUser/SET_USER_CREATED_AT';

export const SignInState = makeEnum('Unknown', 'SignedIn', 'SignedOut');

export const CourseRoles = makeEnum('Unknown', 'Instructor', 'Participant');

// Action creators
export const setCurrentUserName = userName => ({
  type: SET_CURRENT_USER_NAME,
  userName,
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
export const setAiRubricsDisabled = aiRubricsDisabled => ({
  type: SET_AI_RUBRICS_DISABLED,
  aiRubricsDisabled,
});
export const setAiDifferentiationEnabled = aiDifferentiationEnabled => ({
  type: SET_AI_DIFFERENTIATION_ENABLED,
  aiDifferentiationEnabled,
});
export const setShowAITALessonSummary = showAITALessonSummary => ({
  type: SET_SHOW_AI_TA_LESSON_SUMMARY,
  showAITALessonSummary,
});
export const setShowAITAPodcasts = showAITAPodcasts => ({
  type: SET_SHOW_AI_TA_PODCASTS,
  showAITAPodcasts,
});
export const setHasCompletedPersonalizationQuiz =
  hasCompletedPersonalizationQuiz => ({
    type: SET_HAS_COMPLETED_PERSONALIZATION_QUIZ,
    hasCompletedPersonalizationQuiz,
  });
export const setUserCreatedAt = userCreatedAt => ({
  type: SET_USER_CREATED_AT,
  userCreatedAt,
});
export const setHasSeenHomepageWelcome = hasSeenHomepageWelcome => ({
  type: SET_HAS_SEEN_HOMEPAGE_WELCOME,
  hasSeenHomepageWelcome,
});

const initialState = {
  userId: null,
  userName: null,
  userType: 'unknown',
  userRoleInCourse: CourseRoles.Unknown,
  signInState: SignInState.Unknown,
  aiDifferentiationEnabled: null,
  showAITALessonSummary: false,
  showAITAPodcasts: false,
  hasCompletedPersonalizationQuiz: false,
  isBackgroundMusicMuted: false,
  isSortedByFamilyName: false,
  isLti: undefined,
  isTeacher: undefined,
  isLevelbuilder: undefined,
  // Setting default under13 value to true to err on the side of caution for age-restricted content.
  under13: true,
  over21: false,
  childAccountComplianceState: null,
  countryCode: null,
  usStateCode: null,
  inSection: null,
  userCreatedAt: null,
  userSharingDisabled: false,
  hasSeenHomepageWelcome: false,
};

export default function currentUser(state = initialState, action) {
  if (action.type === SET_CURRENT_USER_NAME) {
    return {
      ...state,
      userName: action.userName,
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
  if (action.type === SET_AI_RUBRICS_DISABLED) {
    return {
      ...state,
      aiRubricsDisabled: action.aiRubricsDisabled,
    };
  }
  if (action.type === SET_AI_DIFFERENTIATION_ENABLED) {
    return {
      ...state,
      aiDifferentiationEnabled: action.aiDifferentiationEnabled,
    };
  }
  if (action.type === SET_SHOW_AI_TA_LESSON_SUMMARY) {
    return {
      ...state,
      showAITALessonSummary: action.showAITALessonSummary,
    };
  }
  if (action.type === SET_SHOW_AI_TA_PODCASTS) {
    return {
      ...state,
      showAITAPodcasts: action.showAITAPodcasts,
    };
  }
  if (action.type === SET_HAS_COMPLETED_PERSONALIZATION_QUIZ) {
    return {
      ...state,
      hasCompletedPersonalizationQuiz: action.hasCompletedPersonalizationQuiz,
    };
  }
  if (action.type === SET_USER_CREATED_AT) {
    return {
      ...state,
      userCreatedAt: action.userCreatedAt,
    };
  }
  if (action.type === SET_HAS_SEEN_HOMEPAGE_WELCOME) {
    return {
      ...state,
      hasSeenHomepageWelcome: action.hasSeenHomepageWelcome,
    };
  }

  if (action.type === SET_INITIAL_DATA) {
    const {
      id,
      username,
      display_name,
      user_type,
      mute_music,
      under_13,
      over_21,
      sort_by_family_name,
      ai_rubrics_disabled,
      ai_differentiation_enabled,
      is_lti,
      is_levelbuilder,
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
      has_seen_homepage_welcome,
      ai_tutor_enabled_for_pilot,
    } = action.serverUser;
    // TODO: Once Amplitude is fully removed, the StatsigReporter class should be
    // renamed to AnalyticsReporter.
    statsigReporter.setUserProperties({
      userId: id,
      userType: user_type,
      isVerifiedInstructor: is_verified_instructor,
      enabledExperiments: experiments.getEnabledExperiments(),
      educatorRole: educator_role,
    });
    return {
      ...state,
      userId: id,
      userName: username,
      userType: user_type,
      displayName: display_name,
      isBackgroundMusicMuted: mute_music,
      under13: under_13,
      over21: over_21,
      isSortedByFamilyName: sort_by_family_name,
      aiRubricsDisabled: ai_rubrics_disabled,
      aiDifferentiationEnabled: ai_differentiation_enabled,
      isLti: is_lti,
      isTeacher: user_type === UserTypes.TEACHER,
      isLevelbuilder: is_levelbuilder,
      inUSA: ['US', 'RD'].includes(country_code) || !!us_state_code,
      hasCompletedAiDifferentiationWelcome:
        has_completed_ai_differentiation_welcome,
      childAccountComplianceState: child_account_compliance_state,
      countryCode: country_code,
      usStateCode: us_state_code,
      age,
      inSection: in_section,
      userCreatedAt: created_at,
      userSharingDisabled: sharing_disabled,
      hasSeenHomepageWelcome: has_seen_homepage_welcome,
      aiTutorEnabledForPilot: ai_tutor_enabled_for_pilot,
    };
  }

  return state;
}

export const isSignedIn = currentUserState => {
  return currentUserState.signInState === SignInState.SignedIn;
};
