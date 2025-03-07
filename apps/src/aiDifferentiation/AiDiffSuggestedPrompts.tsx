import React, {useState} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

import {ChatPrompt} from './types';

interface ComponentProps {
  suggestedPrompts: ChatPrompt[];
  onSubmit: (selectedPrompt: ChatPrompt) => void;
}

const AiDiffSuggestedPrompts: React.FC<ComponentProps> = ({
  suggestedPrompts,
  onSubmit,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<ChatPrompt>();

  const onClick = (prompt: ChatPrompt) => () => {
    // The first prompt selected is final.
    // Can't select a prompt after something else has happened.
    if (selectedPrompt) {
      return;
    }

    onSubmit(prompt);
    setSelectedPrompt(prompt);
  };

  const structuredPrompts = suggestedPrompts.map(prompt => {
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
