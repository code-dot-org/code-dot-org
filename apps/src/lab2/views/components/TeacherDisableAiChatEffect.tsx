import React, {useEffect} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {APPS_WITH_ESSENTIAL_AI_CHAT} from '@cdo/apps/aichat/helpers/aiChatAccess';
import {AiChatAccessLevel} from '@cdo/apps/aichat/types/accessControls';
import {repackageError} from '@cdo/apps/metrics/analyticsUtils';
import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatAccessLevels} from '@cdo/generated-scripts/sharedConstants';

/**
 * Renders nothing. When mounted inside an AiChatDisabledProvider, fetches the
 * teacher's sections and disables AI chat if none have AI access enabled.
 * Only applies for labs where AI chat is optional (not essential).
 */
const TeacherDisableAiChatEffect: React.FC = () => {
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const labType = useAppSelector(state => state.pageConstants.appType);
  const {setChatDisabledState} = useAiChatDisabled();

  useEffect(() => {
    if (!isTeacher || !labType) return;
    if (APPS_WITH_ESSENTIAL_AI_CHAT.includes(labType)) return;

    HttpClient.fetchJson<{ai_chat_access_level?: AiChatAccessLevel}[]>(
      '/dashboardapi/sections'
    )
      .then(response => {
        const sections = response.value;
        const hasAiChatEnabledInAnySection = sections.some(
          section => section.ai_chat_access_level === AiChatAccessLevels.ENABLED
        );
        if (!hasAiChatEnabledInAnySection) {
          setChatDisabledState({
            chatDisabled: true,
            chatDisabledMessage:
              "You haven't enabled this tool for any of your class sections.",
          });
        }
      })
      .catch(error => {
        // if the fetch fails, leave chat enabled but log
        MetricsReporter.logError({
          event: MetricEvent.AI_TUTOR_TEACHER_DISABLE_FAIL,
          errorMessage: repackageError(error),
        });
      });
  }, [isTeacher, labType, setChatDisabledState]);

  return null;
};

export default TeacherDisableAiChatEffect;
