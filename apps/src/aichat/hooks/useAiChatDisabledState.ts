import {useMemo} from 'react';

import {
  AI_SETTINGS_SUPPORT_LINK,
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
  AI_CHAT_NOT_AVAILABLE_INTERNATIONAL,
  AI_CHAT_LAB_FAQ_LINK,
  AI_TUTOR_FAQ_LINK,
  VERIFIED_TEACHER_SUPPORT_LINK,
} from '@cdo/apps/aichat/constants';
import {
  areAiChatToolsEnabled,
  isGeminiModelId,
} from '@cdo/apps/aichat/helpers/aiChatAccess';
import type {AiChatDisabledState} from '@cdo/apps/aichat/types';
import type {AiChatClientType} from '@cdo/apps/aichat/types/context';
import type {ModelParameters} from '@cdo/apps/aichat/types/model';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

// FAQ article shown with the region-blocked message, keyed by client type.
// Client types without a dedicated article get no link.
const FAQ_LINK_BY_CLIENT_TYPE: Partial<Record<AiChatClientType, string>> = {
  [AiChatClientTypes.AI_CHAT_LAB]: AI_CHAT_LAB_FAQ_LINK,
  [AiChatClientTypes.AI_TUTOR]: AI_TUTOR_FAQ_LINK,
};

interface UseAiChatDisabledStateParams {
  appName?: string;
  clientType?: AiChatClientType;
  selectedModelId?: ModelParameters['selectedModelId'];
  isPredictLevel?: boolean;
  hasSubmittedPredictResponse?: boolean;
}

/**
 * Computes whether AI chat is disabled and what message to show, consolidating:
 * - which aiChatAccessLevel applies (section override for teachers, or user's own)
 * - whether the access level permits chat for the current app & access level
 * - regional blocking of Gemini-served models (pass selectedModelId to enable)
 * - predict level gating
 * - teacher vs. student messaging
 */
export function useAiChatDisabledState({
  appName,
  clientType,
  selectedModelId,
  isPredictLevel = false,
  hasSubmittedPredictResponse = false,
}: UseAiChatDisabledStateParams): AiChatDisabledState {
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const sectionAccessLevel = useAppSelector(
    state => selectedSectionSelector(state)?.aiChatAccessLevel
  );
  const userAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel
  );
  const geminiModelsBlocked = useAppSelector(
    state => state.currentUser.aiChatGeminiModelsBlocked
  );
  const isLevelbuilder = useAppSelector(
    state => state.currentUser.isLevelbuilder
  );

  const enabledForUser = appName
    ? areAiChatToolsEnabled({appName, aiChatAccessLevel: userAccessLevel})
    : false;

  const disabledState: AiChatDisabledState = useMemo(() => {
    if (!appName) {
      return {disabled: true};
    }

    // Levelbuilders should always be enabled so they don't need to do extra account setup when building levels.
    if (isLevelbuilder) {
      return {disabled: false};
    }

    // Disabled on predict levels until the student has submitted a response to avoid spoiling the experience.
    if (isPredictLevel && !hasSubmittedPredictResponse && !getIsStartMode()) {
      return {
        disabled: true,
        disabledMessage: 'Chat is disabled until you submit your prediction.',
      };
    }

    // Gemini-served models are blocked for international users, independent of
    // access level. The server enforces this per-request; this mirrors it so
    // users see a disabled state instead of failing sends. Per product,
    // students keep the standard not-authorized message regardless of cause.
    if (
      geminiModelsBlocked &&
      selectedModelId &&
      isGeminiModelId(selectedModelId)
    ) {
      if (!isTeacher) {
        return {
          disabled: true,
          disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
        };
      }
      const faqLink = clientType && FAQ_LINK_BY_CLIENT_TYPE[clientType];
      return {
        disabled: true,
        disabledMessage: AI_CHAT_NOT_AVAILABLE_INTERNATIONAL,
        ...(faqLink && {
          disabledLink: {
            href: faqLink,
            openInNewTab: true,
            text: 'Learn more',
          },
        }),
      };
    }

    if (isTeacher) {
      // If teacher has access but the currently selected section access level doesn't grant access,
      // show the appropriate message to more closely match the student experience.
      // Note: It might not EXACTLY match the student experience, since the student could
      // technically have access from another teacher's section.
      if (
        enabledForUser &&
        sectionAccessLevel &&
        !areAiChatToolsEnabled({appName, aiChatAccessLevel: sectionAccessLevel})
      ) {
        return {
          disabled: true,
          disabledMessage: 'Chat is disabled for this class section.',
          disabledLink: {
            href: AI_SETTINGS_SUPPORT_LINK,
            openInNewTab: true,
            text: 'Learn more',
          },
        };
      }
      // If the teacher doesn't have access, show the appropriate message.
      if (!enabledForUser) {
        return {
          disabled: true,
          disabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
          disabledLink: {
            href: VERIFIED_TEACHER_SUPPORT_LINK,
            openInNewTab: true,
            text: 'Learn how to become a verified teacher',
          },
        };
      }
      return {disabled: false};
    }

    // User is a student.
    return enabledForUser
      ? {disabled: false}
      : {
          disabled: true,
          disabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
        };
  }, [
    appName,
    clientType,
    selectedModelId,
    isPredictLevel,
    hasSubmittedPredictResponse,
    isTeacher,
    enabledForUser,
    sectionAccessLevel,
    isLevelbuilder,
    geminiModelsBlocked,
  ]);

  return disabledState;
}
