import {useEffect} from 'react';

import {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
} from '@cdo/apps/aichat/constants';
import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {areAiChatToolsEnabled} from '@cdo/apps/aichat/helpers/aiChatAccess';
import lab2I18n from '@cdo/apps/lab2/locale';
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
  let disabledState: AiChatDisabledState;

  if (!appName) {
    disabledState = {chatDisabled: true};
  } else if (
    isPredictLevel &&
    !hasSubmittedPredictResponse &&
    !getIsStartMode()
  ) {
    // Disabled on predict levels until the student has submitted a response to avoid spoiling the experience.
    disabledState = {
      chatDisabled: true,
      chatDisabledMessage: lab2I18n.predictTutorDisabledMessage(),
    };
  } else if (isTeacher) {
    if (
      enabledForUser &&
      sectionAccessLevel &&
      !areAiChatToolsEnabled({
        appName: appName!,
        aiChatAccessLevel: sectionAccessLevel,
      })
    ) {
      // If teacher has access but the currently selected section access level doesn't grant access,
      // show the appropriate message to more closely match the student experience.
      // Note: It might not EXACTLY match the student experience, since the student could
      // technically have access from another teacher's section.
      disabledState = {
        chatDisabled: true,
        chatDisabledMessage: 'Chat is disabled for this class section.',
      };
    } else if (!enabledForUser) {
      // If the teacher doesn't have access, show the appropriate message to direct the teacher on how to get access.
      disabledState = {
        chatDisabled: true,
        chatDisabledMessage: AI_CHAT_NOT_AUTHORIZED_TEACHER,
      };
    } else {
      disabledState = {chatDisabled: false};
    }
  } else {
    // User is a student.
    disabledState = enabledForUser
      ? {chatDisabled: false}
      : {
          chatDisabled: true,
          chatDisabledMessage: AI_CHAT_NOT_AUTHORIZED_STUDENT,
        };
  }

  useEffect(() => {
    setChatDisabledState(disabledState);
  }, [disabledState, setChatDisabledState]);
}
