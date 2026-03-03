import React, {FC} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

const PracticeOptions: FC<{
  selectedOption: string;
  onChange: (option: string) => void;
}> = ({selectedOption, onChange}) => {
  const practiceOptions = [
    {
      value: 'summary',
      label: 'Summarize Lesson',
      icon: 'file-lines',
      prompt: 'Summarize the main points of the lesson.',
    },
    {
      value: 'flashcards',
      label: 'Vocabulary Flashcards',
      icon: 'cards-blank',
      prompt: 'Create flashcards for the vocabulary words.',
    },
  ];

  const onClick = (prompt: string) => () => {
    onChange(prompt);
  };
  return (
    <>
      <SuggestedPrompts
        suggestedPrompts={practiceOptions.map(option => ({
          label: option.label,
          onClick: onClick(option.value),
          show: true,
          selected: selectedOption === option.value,
          icon: option.icon,
        }))}
      />
    </>
  );
};

export default PracticeOptions;
