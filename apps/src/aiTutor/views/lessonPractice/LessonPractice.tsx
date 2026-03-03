import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import PracticeOptions from './PracticeOptions';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';
import {baseModelParameters} from '../../hooks/useAiTutorModelParameters';

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
          text="I'm here you to help you review the material from the lesson. How can I help?"
          role={Role.ASSISTANT}
          isAiTutorVersion={true}
        />
      </div>
      <PracticeOptions
        selectedOption={selectedOption || ''}
        onChange={option => setSelectedOption(option as PracticeOption)}
      />
      <ChatWorkspace
        modelParameters={baseModelParameters}
        clientType={AiChatClientTypes.AI_TUTOR}
      />
      {vocabulary.length > 0 && (
        <>
          <Typography variant="h3">Vocabulary</Typography>
          <ul>
            {vocabulary.map(v => (
              <li key={v.id}>
                <strong>{v.word}</strong>: {v.definition}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};
