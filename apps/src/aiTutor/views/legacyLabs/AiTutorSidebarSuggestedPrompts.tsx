import Button from '@code-dot-org/component-library/button';
import {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useCallback} from 'react';

import {submitChatContents} from '@cdo/apps/aichat/redux';
import {AnalyticsProperties} from '@cdo/apps/aichat/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {useAiTutorModelParameters} from '../../hooks/useAiTutorModelParameters';
import {AiTutorSuggestedPrompt} from '../../suggestedPrompts';

import styles from './AiTutorSidebar.module.scss';

interface AiTutorSidebarSuggestedPromptsProps {
  className?: string;
  suggestedPrompts?: Array<AiTutorSuggestedPrompt>;
  hiddenContextCallback: () => Promise<string>;
  toggleAiChat: () => void;
}

const AiTutorSidebarSuggestedPrompts: React.FC<
  AiTutorSidebarSuggestedPromptsProps
> = ({
  hiddenContextCallback,
  toggleAiChat,
  className = '',
  suggestedPrompts = [],
}) => {
  const dispatch = useAppDispatch();
  const {modelParameters} = useAiTutorModelParameters();

  const handleSubmit = useCallback(
    async (userMessage: string, analyticsProperties?: AnalyticsProperties) => {
      if (!modelParameters) {
        return;
      }

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
    [toggleAiChat, hiddenContextCallback, dispatch, modelParameters]
  );

  return (
    <div className={`ai-tutor-suggested-prompts ${className}`}>
      <div className="ai-tutor-suggested-prompts-list">
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
            onClick={() =>
              handleSubmit(prompt.value, prompt.analyticsProperties)
            }
            key={prompt.id}
            size="m"
            type="primary"
            color="white"
            disabled={!modelParameters}
          />
        ))}
      </div>
    </div>
  );
};

export default AiTutorSidebarSuggestedPrompts;
