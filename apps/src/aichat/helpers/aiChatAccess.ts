import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import experiments from '@cdo/apps/util/experiments';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

// A list of app names for which AI Chat tools (tutor or chat in ai chat lab) are considered essential to the app experience.
// but can still be disabled by teachers through the access controls in the teacher dashboard (see ai_chat_access_level)
const APPS_WHERE_AI_TUTOR_IS_ESSENTIAL = ['weblab2'];
export const APPS_WITH_ESSENTIAL_AI_CHAT = [
  ...APPS_WHERE_AI_TUTOR_IS_ESSENTIAL,
  'aichat',
];

export const shouldShowAiTutor = ({
  appName,
  tutorLevel,
  tutorPilot,
  aiChatAccessLevel,
}: {
  appName: string;
  tutorLevel?: boolean;
  tutorPilot?: boolean;
  aiChatAccessLevel: AiChatAccessLevel;
}) => {
  return (
    APPS_WHERE_AI_TUTOR_IS_ESSENTIAL.includes(appName) ||
    // user is in ai tutor pilot and it's a tutor enabled level
    (tutorPilot &&
      tutorLevel &&
      // For now, we are going to fully hide optional tutor rather than showing the disabled ui,
      // to avoid disrupting classrooms that are in the middle of the school year working on
      // courses where optional tutor is available.
      areAiChatToolsEnabled({appName, aiChatAccessLevel}))
  );
};

/**
 * Returns true if the access level setting permits AI Chat tools for the
 * given app.
 *
 * For apps in APPS_WITH_ESSENTIAL_AI_CHAT (e.g. weblab2 or aichat),
 * AI Chat tools are essential and are enabled under ESSENTIAL_ONLY or ENABLED.
 * For all other apps, AI Chat tools are non-essential and require explicit
 * ENABLED access.
 */
export const areAiChatToolsEnabled = ({
  appName,
  aiChatAccessLevel,
}: {
  appName: string;
  aiChatAccessLevel: AiChatAccessLevel;
}): boolean => {
  if (!experiments.isEnabled(experiments.AI_CHAT_NEW_PERMISSIONS)) {
    // only disable AI Chat tools based on AiChatAccessLevel if the new permissions experiment is enabled!
    return true;
  }
  if (APPS_WITH_ESSENTIAL_AI_CHAT.includes(appName)) {
    // either ESSENTIAL_ONLY or ENABLED access level permits AI Chat tools for apps that consider AI Chat essential
    return aiChatAccessLevel !== AiChatAccessLevels.DISABLED;
  }
  return aiChatAccessLevel === AiChatAccessLevels.ENABLED;
};
