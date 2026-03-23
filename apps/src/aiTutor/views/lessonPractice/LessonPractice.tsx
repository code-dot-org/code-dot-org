import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import GenericStudentLessonSummary from './GenericStudentLessonSummary';
import LessonPracticeChatWorkspace from './LessonPracticeChatWorkspace';
import PracticeOptions from './PracticeOptions';
import VocabularyFlashcards from './VocabularyFlashcards';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';

type PracticeOption = 'summary' | 'flashcards' | 'chat' | null;

interface LessonPracticeData {
  lessonName: string;
  lessonSummary: string;
  vocabulary: {id: string; word: string; definition: string}[];
  scriptId: string;
  lessonPosition: number;
}

export const LessonPractice: FC<{lessonPracticeData: LessonPracticeData}> = ({
  lessonPracticeData,
}) => {
  const {lessonName, lessonSummary, vocabulary, scriptId, lessonPosition} =
    lessonPracticeData;

  const [selectedOption, setSelectedOption] = useState<PracticeOption | null>(
    null
  );

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
        showVocabularyOption={vocabulary.length > 0}
      />
      {selectedOption === 'summary' && (
        <GenericStudentLessonSummary lessonSummary={lessonSummary} />
      )}
      {selectedOption === 'flashcards' && vocabulary.length > 0 && (
        <VocabularyFlashcards vocabulary={vocabulary} />
      )}
      {selectedOption === 'chat' && (
        <LessonPracticeChatWorkspace
          scriptId={scriptId}
          lessonPosition={lessonPosition}
          vocabulary={vocabulary}
        />
      )}
    </>
  );
};
