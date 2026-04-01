import {useEffect, useMemo} from 'react';

import {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
} from '@cdo/apps/aichat/constants';
import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {areAiChatToolsEnabled} from '@cdo/apps/aichat/helpers/aiChatAccess';
import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';
import {selectedSectionSelector} from '@cdo/apps/templates/teacherDashboard/teacherSectionsReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface UseAiChatDisabledStateParams {
  appName?: string;
  isPredictLevel: boolean;
  hasSubmittedPredictResponse: boolean;
}

export interface AiChatDisabledState {
  chatDisabled: boolean;
  chatDisabledMessage?: string;
}

/**
 * Computes whether AI chat is disabled and what message to show, consolidating:
 * - which aiChatAccessLevel applies (section override for teachers, or user's own)
 * - whether the access level permits chat for the current app & access level
 * - predict level gating
 * - teacher vs. student messaging
 */
export function useAiChatDisabledState({
  appName,
  isPredictLevel,
  hasSubmittedPredictResponse,
}: UseAiChatDisabledStateParams) {
  const {setChatDisabledState} = useAiChatDisabled();
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const sectionAccessLevel = useAppSelector(
    state => selectedSectionSelector(state)?.aiChatAccessLevel
  );
  const userAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel
  );
  const enabledForUser = appName
    ? areAiChatToolsEnabled({appName, aiChatAccessLevel: userAccessLevel})
    : false;

  const disabledState: AiChatDisabledState = useMemo(() => {
    if (!appName) {
      return {chatDisabled: true};
    }

    // Disabled on predict levels until the student has submitted a response to avoid spoiling the experience.
    if (isPredictLevel && !hasSubmittedPredictResponse && !getIsStartMode()) {
      return {
        chatDisabled: true,
        chatDisabledMessage:
          'Chat is disabled until you submit your prediction.',
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
        !areAiChatToolsEnabled({
          appName: appName!,
          aiChatAccessLevel: sectionAccessLevel,
        })
      ) {
        return {
          chatDisabled: true,
          chatDisabledMessage: 'Chat is disabled for this class section.',
        };
      }
      // If the teacher doesn't have access, show the appropriate message to direct the teacher on how to get access.
      if (!enabledForUser) {
        return {
          chatDisabled: true,
          chatDisabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
        };
      }
      return {chatDisabled: false};
    }

    // User is a student.
    return enabledForUser
      ? {chatDisabled: false}
      : {
          chatDisabled: true,
          chatDisabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
        };
  }, [
    appName,
    isPredictLevel,
    hasSubmittedPredictResponse,
    isTeacher,
    enabledForUser,
    sectionAccessLevel,
  ]);

  useEffect(() => {
    setChatDisabledState(disabledState);
  }, [disabledState, setChatDisabledState]);
}
