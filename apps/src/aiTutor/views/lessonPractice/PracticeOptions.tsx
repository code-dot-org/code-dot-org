import React, {FC} from 'react';

import SuggestedPrompts from '@cdo/apps/aiComponentLibrary/suggestedPrompt/SuggestedPrompts';

const PracticeOptions: FC<{
  selectedOption: string;
  onChange: (option: string) => void;
  showVocabularyOption: boolean;
  showBonusLevelsOption: boolean;
}> = ({
  selectedOption,
  onChange,
  showVocabularyOption,
  showBonusLevelsOption,
}) => {
  const practiceOptions = [
    {
      value: 'summary',
      label: 'Summarize Lesson',
      icon: 'file-lines',
      prompt: 'Summarize the main points of the lesson.',
      show: true,
    },
    {
      value: 'flashcards',
      label: 'Vocabulary Flashcards',
      icon: 'cards-blank',
      prompt: 'Create flashcards for the vocabulary words.',
      show: showVocabularyOption,
    },
    {
      value: 'chat',
      label: 'Chat with Tutor',
      icon: 'comment',
      prompt: 'I want to chat with the tutor about the lesson.',
      show: true,
    },
    {
      value: 'bonus-levels',
      label: 'Bonus Levels',
      icon: 'star',
      prompt: 'I want to practice bonus levels.',
      show: showBonusLevelsOption,
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
          show: option.show,
          selected: selectedOption === option.value,
          icon: option.icon,
        }))}
        canToggle={true}
      />
    </>
  );
};

export default PracticeOptions;
