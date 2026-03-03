import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import PracticeOptions from './PracticeOptions';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';
import {baseModelParameters} from '../../hooks/useAiTutorModelParameters';
import VocabularyFlashcards from './VocabularyFlashcards';

type PracticeOption = 'summary' | 'flashcards' | 'chat';

export const LessonPractice: FC<{
  lessonName: string;
  vocabulary: {id: string; word: string; definition: string}[];
}> = ({lessonName, vocabulary}) => {
  const [selectedOption, setSelectedOption] = useState<PracticeOption | null>(
    null
  );

  console.log('selectedOption', selectedOption);

  return (
    <>
      <Typography variant="h2">Lesson Practice for {lessonName}</Typography>
      <div className={styles.welcomeMessage}>
        <ChatMessage
          text="Let's review the material from the lesson. How can I help?"
          role={Role.ASSISTANT}
          isAiTutorVersion={true}
        />
      </div>
      <PracticeOptions
        selectedOption={selectedOption || ''}
        onChange={option => setSelectedOption(option as PracticeOption)}
      />
      {/* {selectedOption === 'summary' && <GenericStudentLessonSummary />} */}
      {selectedOption === 'flashcards' && (
        <VocabularyFlashcards vocabulary={vocabulary} />
      )}
      <ChatWorkspace
        modelParameters={baseModelParameters}
        clientType={AiChatClientTypes.AI_TUTOR}
      />
    </>
  );
};
