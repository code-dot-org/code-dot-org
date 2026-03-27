import React, {FC} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

const PracticeOptions: FC<{
  selectedOption: string;
  onChange: (option: string) => void;
  showVocabularyOption: boolean;
}> = ({selectedOption, onChange, showVocabularyOption}) => {
  const practiceOptions = [
    {
      value: 'summary',
      label: 'Summarize Lesson',
      icon: 'file-lines',
      show: true,
    },
    {
      value: 'flashcards',
      label: 'Vocabulary Flashcards',
      icon: 'cards-blank',
      show: showVocabularyOption,
    },
    {
      value: 'chat',
      label: 'Chat with Tutor',
      icon: 'comment',
      show: true,
    },
    {
      value: 'agentic-chat',
      label: 'WIP Agentic Chat with Tutor',
      icon: 'robot',
      show: true,
    },
  ];

  return (
    <SuggestedPrompts
      suggestedPrompts={practiceOptions.map(option => ({
        label: option.label,
        onClick: () => onChange(option.value),
        show: option.show,
        selected: selectedOption === option.value,
        icon: option.icon,
      }))}
      canToggle={true}
    />
  );
};

export default PracticeOptions;
