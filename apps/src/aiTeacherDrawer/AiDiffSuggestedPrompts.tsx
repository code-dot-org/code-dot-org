import React from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {setSelectedPrompt} from '@cdo/apps/aiTeacherDrawer/redux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {presetIdFromLabel, sendTaEvent, truncateForStatsig} from './analytics';
import {ChatPrompt} from './types';

interface ComponentProps {
  suggestedPrompts: ChatPrompt[];
  isLatest: boolean;
  onSubmit: (selectedPrompt: ChatPrompt) => void;
  /** Which menu these chips came from, for reporting. */
  presetSet?: string;
}

const AiDiffSuggestedPrompts: React.FC<ComponentProps> = ({
  suggestedPrompts,
  isLatest,
  onSubmit,
  presetSet = 'default',
}) => {
  const selectedPrompt = useAppSelector(
    state => state.aiDiffChat.selectedPrompt
  );
  const threadId = useAppSelector(state => state.aiDiffChat.threadId);

  const dispatch = useAppDispatch();

  const onClick = (prompt: ChatPrompt, position: number) => () => {
    // The first prompt selected is final.
    // Can't select a prompt after something else has happened.
    if (
      (selectedPrompt && suggestedPrompts.includes(selectedPrompt)) ||
      !isLatest
    ) {
      return;
    }

    sendTaEvent(
      EVENTS.AI_TA_PRESET_PROMPT_CLICKED,
      {
        preset_id: presetIdFromLabel(prompt.label),
        preset_position: position,
        preset_set: presetSet,
        is_new_chat: threadId === 0,
      },
      truncateForStatsig(prompt.label)
    );

    onSubmit(prompt);
    dispatch(setSelectedPrompt(prompt));
  };

  const structuredPrompts = suggestedPrompts
    .filter(prompt => prompt !== undefined)
    .map((prompt, position) => {
      return {
        label: prompt.label,
        selected: prompt === selectedPrompt,
        onClick: onClick(prompt, position),
        show: true,
        icon: prompt.artifactCandidateType ? 'shapes' : undefined,
      };
    });

  return <SuggestedPrompts suggestedPrompts={structuredPrompts} />;
};

export default AiDiffSuggestedPrompts;
