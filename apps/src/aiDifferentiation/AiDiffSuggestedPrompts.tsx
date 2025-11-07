import React from 'react';

import {setSelectedPrompt} from '@cdo/apps/aichat/redux/slice';
import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatPrompt} from './types';

interface ComponentProps {
  suggestedPrompts: ChatPrompt[];
  isLatest: boolean;
  onSubmit: (selectedPrompt: ChatPrompt) => void;
}

const AiDiffSuggestedPrompts: React.FC<ComponentProps> = ({
  suggestedPrompts,
  isLatest,
  onSubmit,
}) => {
  const selectedPrompt = useAppSelector(state => state.aichat.selectedPrompt);

  const dispatch = useAppDispatch();

  const onClick = (prompt: ChatPrompt) => () => {
    // The first prompt selected is final.
    // Can't select a prompt after something else has happened.
    if (
      (selectedPrompt && suggestedPrompts.includes(selectedPrompt)) ||
      !isLatest
    ) {
      return;
    }

    onSubmit(prompt);
    dispatch(setSelectedPrompt(prompt));
  };

  const structuredPrompts = suggestedPrompts
    .filter(prompt => prompt !== undefined)
    .map(prompt => {
      return {
        label: prompt.label,
        selected: prompt === selectedPrompt,
        onClick: onClick(prompt),
        show: true,
      };
    });

  return <SuggestedPrompts suggestedPrompts={structuredPrompts} />;
};

export default AiDiffSuggestedPrompts;
