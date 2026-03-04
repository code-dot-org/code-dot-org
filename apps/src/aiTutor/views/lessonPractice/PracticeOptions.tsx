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
      prompt: 'Summarize the main points of the lesson.',
      show: true,
    },
    {
      value: 'student-work-summary',
      label: 'Analyze Student Work',
      icon: 'list-check',
      prompt: 'Summarize the student work for this lesson.',
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
