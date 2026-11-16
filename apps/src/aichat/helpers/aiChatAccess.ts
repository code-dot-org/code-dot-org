import shouldUseAiGateway from '@cdo/apps/aichat/api/shouldUseAiGateway';
import {
  AiChatAccessLevel,
  AiChatToolsDependencyValue,
} from '@cdo/apps/aichat/types/accessControls';
import type {AiChatClientType} from '@cdo/apps/aichat/types/context';
import type {ModelParameters} from '@cdo/apps/aichat/types/model';
import DCDO from '@cdo/apps/dcdo';
import {
  AiChatAccessLevels,
  AiChatGeminiImageModelIds,
  AiChatProviderByModelId,
  AiChatToolsDependency,
  AiGatewayFallbackClientTypes,
} from '@cdo/generated-scripts/sharedConstants';

/**
 * Returns true if the provider serving modelId is among blockedProviders
 * (currentUser.blockedAichatProviders).
 */
export const isAiChatModelBlocked = (
  modelId: string,
  blockedProviders: readonly string[]
): boolean => {
  const provider = (AiChatProviderByModelId as Record<string, string>)[modelId];
  return !!provider && blockedProviders.includes(provider);
};

// Also lets AiGatewayAuthController mint tokens for users with blocked providers.
export const AI_GATEWAY_FALLBACK_DCDO_KEY = 'ai_gateway_fallback_is_enabled';

/**
 * Returns true if the AI gateway serves a model from a blocked provider by
 * falling back to another provider.
 */
export const isAiGatewayFallbackEnabled = (): boolean =>
  !!DCDO.get(AI_GATEWAY_FALLBACK_DCDO_KEY, false);

const FALLBACK_CLIENT_TYPES: ReadonlySet<string> = new Set(
  AiGatewayFallbackClientTypes
);
const GEMINI_IMAGE_MODEL_IDS: ReadonlySet<string> = new Set(
  AiChatGeminiImageModelIds
);

// The client's half of User::AiAccessible#should_ai_gateway_fall_back?; Rails cannot see client routing.
export const shouldGatewayFallBack = (
  modelId: ModelParameters['selectedModelId'],
  clientType: AiChatClientType | undefined
): boolean =>
  isAiGatewayFallbackEnabled() &&
  !!clientType &&
  FALLBACK_CLIENT_TYPES.has(clientType) &&
  !GEMINI_IMAGE_MODEL_IDS.has(modelId) &&
  shouldUseAiGateway(modelId);

// A list of app names for which AI Chat tools (tutor or chat in ai chat lab) are considered essential to the app experience.
// but can still be disabled by teachers through the access controls in the teacher dashboard (see ai_chat_access_level)
const APPS_WHERE_AI_TUTOR_IS_ESSENTIAL = ['weblab2'];
export const APPS_WITH_ESSENTIAL_AI_CHAT = [
  ...APPS_WHERE_AI_TUTOR_IS_ESSENTIAL,
  'aichat',
];

export const shouldShowAiTutor = ({
  appName,
  isTutorLevel,
  aiChatAccessLevel,
}: {
  appName: string;
  isTutorLevel?: boolean;
  aiChatAccessLevel: AiChatAccessLevel;
}) => {
  return (
    APPS_WHERE_AI_TUTOR_IS_ESSENTIAL.includes(appName) ||
    (isTutorLevel &&
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
  if (APPS_WITH_ESSENTIAL_AI_CHAT.includes(appName)) {
    // either ESSENTIAL_ONLY or ENABLED access level permits AI Chat tools for apps that consider AI Chat essential
    return aiChatAccessLevel !== AiChatAccessLevels.DISABLED;
  }
  return aiChatAccessLevel === AiChatAccessLevels.ENABLED;
};

// Lesson deep dive is not tied to a level, so essential-only access does not unlock it.
export const canUseLessonDeepDive = (
  aiChatAccessLevel: AiChatAccessLevel | undefined
): boolean =>
  !!DCDO.get('lesson-deep-dive-enabled', true) &&
  aiChatAccessLevel === AiChatAccessLevels.ENABLED;

/**
 * Returns true if the AI Chat essential alert should be shown for a section
 * in the Teacher Dashboard AI Settings.
 * This is when a course requires essential AI tools but they are inaccessible
 * either because the section's access level is DISABLED or because the
 * teacher's own access level is DISABLED (unverified teacher).
 */
export const shouldShowAiChatEssentialAlert = ({
  assignedAiChatToolsDependency,
  sectionAiChatAccessLevel,
  teacherAiChatAccessLevel,
}: {
  assignedAiChatToolsDependency: AiChatToolsDependencyValue | undefined;
  sectionAiChatAccessLevel: AiChatAccessLevel;
  teacherAiChatAccessLevel: AiChatAccessLevel;
}): boolean => {
  return (
    assignedAiChatToolsDependency === AiChatToolsDependency.ESSENTIAL &&
    (sectionAiChatAccessLevel === AiChatAccessLevels.DISABLED ||
      teacherAiChatAccessLevel === AiChatAccessLevels.DISABLED)
  );
};
