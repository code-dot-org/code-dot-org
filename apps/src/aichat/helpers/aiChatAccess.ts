import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import experiments from '@cdo/apps/util/experiments';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

// A list of app names for which AI Chat tools (tutor or chat in ai chat lab) are considered essential to the app experience.
// but can still be disabled by teachers through the access controls in the teacher dashboard (see ai_chat_access_level)
export const APPS_WITH_ESSENTIAL_AI_CHAT = ['weblab2', 'aichat'];

export const shouldShowAiTutor = ({
  appName,
  tutorLevel,
  tutorPilot,
}: {
  appName: string;
  tutorLevel?: boolean;
  tutorPilot?: boolean;
}) => {
  return (
    APPS_WITH_ESSENTIAL_AI_CHAT.includes(appName) ||
    // user is in ai tutor pilot and it's a tutor enabled level
    (tutorPilot && tutorLevel)
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
    return aiChatAccessLevel !== AiChatAccessLevels.DISABLED;
  }
  return aiChatAccessLevel === AiChatAccessLevels.ENABLED;
};
