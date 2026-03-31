import FontAwesomeV6Icon, {
  FontAwesomeV6IconProps,
} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {submitChatContents} from '@cdo/apps/aichat/redux';
import {AnalyticsProperties} from '@cdo/apps/aichat/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {useAiTutorModelParameters} from '../../hooks/useAiTutorModelParameters';
import {AiTutorSuggestedPrompt} from '../../suggestedPrompts';
import {AnalyticsData} from '../../types';

import styles from './AiTutorSidebar.module.scss';

interface AiTutorSidebarSuggestedPromptsProps {
  className?: string;
  suggestedPrompts?: Array<AiTutorSuggestedPrompt>;
  hiddenContextCallback: () => Promise<string>;
  toggleAiChat: () => void;
  analyticsData: AnalyticsData;
}

const AiTutorSidebarSuggestedPrompts: React.FC<
  AiTutorSidebarSuggestedPromptsProps
> = ({
  hiddenContextCallback,
  toggleAiChat,
  className = '',
  suggestedPrompts = [],
  analyticsData,
}) => {
  const dispatch = useAppDispatch();
  const {chatDisabled} = useAiChatDisabled();
  const teacherViewingStudentChatHistory = useAppSelector(
    state => state.progress.viewAsUserId
  );
  const {modelParameters} = useAiTutorModelParameters();
  const suggestedPromptsDisabled =
    !modelParameters || !!chatDisabled || !!teacherViewingStudentChatHistory;

  const handleSubmit = useCallback(
    async (userMessage: string, analyticsProperties?: AnalyticsProperties) => {
      if (!modelParameters) {
        return;
      }

      analyticsReporter.sendEvent(EVENTS.AI_TUTOR_SIDEBAR_CLICK, {
        prompt: analyticsProperties?.cannedPrompt,
        labType: analyticsData.labType,
        levelId: analyticsData.levelId,
        unitId: analyticsData.unitId,
        channelId: analyticsData.channelId,
        url: analyticsData.location,
      });

      toggleAiChat();
      const hiddenContext = await hiddenContextCallback?.();
      dispatch(
        submitChatContents({
          text: userMessage,
          modelParameters,
          clientType: AiChatClientTypes.AI_TUTOR,
          hiddenContext,
          analyticsProperties,
        })
      );
    },
    [
      toggleAiChat,
      hiddenContextCallback,
      dispatch,
      modelParameters,
      analyticsData,
    ]
  );

  return (
    <div className={styles['ai-tutor-suggested-prompts-list']}>
      {suggestedPrompts.map(prompt => (
        <MuiButton
          key={prompt.id}
          variant="contained"
          color="white"
          size="medium"
          className={styles['ai-tutor-suggested-prompt-item']}
          onClick={() => handleSubmit(prompt.value, prompt.analyticsProperties)}
          aria-label={prompt.label}
          type="button"
          disabled={suggestedPromptsDisabled}
        >
          <FontAwesomeV6Icon
            {...(prompt.icon as FontAwesomeV6IconProps)}
            className={classNames(
              styles['icon'],
              prompt.icon?.iconName &&
                !suggestedPromptsDisabled &&
                styles[`icon-${prompt.icon.iconName}`]
            )}
          />
        </MuiButton>
      ))}
    </div>
  );
};

export default AiTutorSidebarSuggestedPrompts;
