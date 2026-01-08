import Button from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import React, {useState} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import style from './flag-response-button.module.scss';

import HttpClient from '@cdo/apps/util/HttpClient';

const FlagResponseButton: React.FC<{
  chatMessageId: string;
  chatMessageText: string;
  modelParameters?: Record<string, unknown>;
}> = ({chatMessageId, chatMessageText, modelParameters}) => {
  const [showInput, setShowInput] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const aichat = useAppSelector(state => state.aichat);
  const analyticsData = useAppSelector(state => state.pageConstants);

  // console.log('current state:', state);

  const saveResponseToLangfuse = async (
    chatMessageId: string,
    chatMessageText: string,
    flagReason: string,
    modelId: string,
    systemPrompt: string
  ) => {
    const url = `/langfuse/add_dataset_item`;
    const payload = {
      datasetName: 'raw-wonky-ai-responses',
      input: {text: chatMessageText},
      metadata: {
        messageId: chatMessageId,
        reason: flagReason,
        conversation: aichat.chatEventsCurrent,
        appType: analyticsData.appType,
        scriptId: analyticsData.serverScriptId,
        levelId: analyticsData.serverLevelId,
        userId: analyticsData.userId,
        modelId: modelId,
        systemPromptName: systemPrompt,
      },
    };
    const response = await HttpClient.post(url, JSON.stringify(payload), true, {
      'Content-Type': 'application/json; charset=UTF-8',
    });
    return response.ok;
  };

  return (
    <div className={style.flagWrapper}>
      <WithTooltip
        tooltipProps={{
          tooltipId: 'internal-flag-tooltip',
          direction: 'onLeft',
          size: 'xs',
          text: 'Is something notable about this AI response? Log to Langfuse for review.',
          className: style.tooltip,
        }}
      >
        <Button
          onClick={() => {
            setShowInput(!showInput);
          }}
          color="gray"
          size="xs"
          isIconOnly
          icon={{
            iconStyle: 'solid',
            iconName: 'magnifying-glass-chart',
          }}
          type="tertiary"
        />
      </WithTooltip>
      {showInput && (
        <>
          <input
            className={style.flagInput}
            value={flagReason}
            placeholder="Reason"
            onChange={event => setFlagReason(event.target.value)}
          />
          <Button
            onClick={() => {
              setFlagReason('');
              saveResponseToLangfuse(
                chatMessageId,
                chatMessageText,
                flagReason,
                modelParameters?.selectedModelId as string,
                modelParameters?.systemPromptName as string
              );
            }}
            color="purple"
            size="xs"
            type="primary"
            text="save"
          />
        </>
      )}
    </div>
  );
};

export default FlagResponseButton;
