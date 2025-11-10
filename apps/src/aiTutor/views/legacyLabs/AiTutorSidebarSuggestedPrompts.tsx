import Button from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {submitChatContents} from '@cdo/apps/aichat/redux';
import {AnalyticsProperties} from '@cdo/apps/aichat/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
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
  const {modelParameters} = useAiTutorModelParameters();

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
        <Button
          className={styles['ai-tutor-suggested-prompt-item']}
          aria-label={prompt.label}
          isIconOnly
          icon={
            {
              ...prompt.icon,
              className: classNames({
                [styles['icon']]: true,
                [styles[`icon-${prompt.icon?.iconName}`]]: prompt.icon,
              }),
            } as FontAwesomeV6IconProps
          }
          onClick={() => handleSubmit(prompt.value, prompt.analyticsProperties)}
          key={prompt.id}
          size="m"
          type="primary"
          color="white"
          disabled={!modelParameters}
        />
      ))}
    </div>
  );
};

export default AiTutorSidebarSuggestedPrompts;
