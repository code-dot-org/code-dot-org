import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Button as MuiButton, IconButton as MuiIconButton} from '@mui/material';
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
    const url = `/ai_observability/add_internal_ai_tutor_dataset_item`;
    const payload = {
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
        <MuiIconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={() => {
            setShowInput(!showInput);
          }}
          type="button"
        >
          <FontAwesomeV6Icon
            iconStyle="solid"
            iconName="magnifying-glass-chart"
          />
        </MuiIconButton>
      </WithTooltip>
      {showInput && (
        <>
          <input
            className={style.flagInput}
            value={flagReason}
            placeholder="Reason"
            onChange={event => setFlagReason(event.target.value)}
          />
          <MuiButton
            variant="contained"
            color="primary"
            size="extraSmall"
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
            type="button"
          >
            {'save'}
          </MuiButton>
        </>
      )}
    </div>
  );
};

export default FlagResponseButton;
