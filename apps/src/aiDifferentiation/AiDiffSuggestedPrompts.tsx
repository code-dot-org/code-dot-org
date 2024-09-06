import React, {useState} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

interface ComponentProps {
  suggestedPrompts: string[];
  isLatest: boolean;
  onSubmit: (selectedPrompt: string) => void;
}

const AiDiffSuggestedPrompts: React.FC<ComponentProps> = ({
  suggestedPrompts,
  isLatest,
  onSubmit,
}) => {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  const onClick = (prompt: string) => () => {
    // The first prompt selected is final.
    // Can't select a prompt after something else has happened.
    if (selectedPrompt || !isLatest) {
      return;
    }

    onSubmit(prompt);
    setSelectedPrompt(prompt);
  };

  const structuredPrompts = suggestedPrompts.map(prompt => {
    return {
      label: prompt,
      selected: prompt === selectedPrompt,
      onClick: onClick(prompt),
      show: true,
    };
  });

  return <SuggestedPrompts suggestedPrompts={structuredPrompts} />;
};

export default AiDiffSuggestedPrompts;
