import Button from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import React, {useState} from 'react';

import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ModelParameters} from '../types';

import style from './flag-response-button.module.scss';

/** Component used to internally send data to Langfuse to create
 * a dataset of potentially problematic AI responses. Only visible to
 * levelbuilders.
 */
const FlagResponseButton: React.FC<{
  chatMessageId: number;
  chatMessageText: string;
  modelParameters?: ModelParameters;
}> = ({chatMessageId, chatMessageText, modelParameters}) => {
  const [showInput, setShowInput] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const aichat = useAppSelector(state => state.aichat);
  const legacyLabData = useAppSelector(state => state.pageConstants);
  const labData = useAppSelector(state => state.lab);
  const user = useAppSelector(state => state.currentUser);

  const analyticsData = {
    appType: labData ? labData.levelProperties?.appName : legacyLabData.appType,
    levelId: labData
      ? labData.levelProperties?.id
      : legacyLabData.serverLevelId,
    scriptId: labData ? labData.scriptId : legacyLabData.serverScriptId,
    userId: user.userId,
    aiTutorMode: labData ? labData.levelProperties?.aiTutorMode : undefined,
    levelSystemPrompt: labData
      ? labData.levelProperties?.levelSystemPrompt
      : undefined,
  };

  const saveResponseToLangfuse = async (
    chatMessageId: number,
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
        modelId: modelId,
        systemPrompt: systemPrompt,
        ...analyticsData,
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
                modelParameters?.systemPrompt as string
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
