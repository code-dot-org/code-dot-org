import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {baseModelParameters} from '../../hooks/useAiTutorModelParameters';

import GenericStudentLessonSummary from './GenericStudentLessonSummary';
import ParsonsProblem from './ParsonsProblem';
import PracticeOptions from './PracticeOptions';
import StudentWorkLessonSummary from './StudentWorkLessonSummary';
import VocabularyFlashcards from './VocabularyFlashcards';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';

type PracticeOption =
  | 'summary'
  | 'flashcards'
  | 'chat'
  | 'student-work-summary'
  | 'parsons-problem'
  | null;

export const LessonPractice: FC<{
  lessonPracticeData: {
    lessonId: number;
    unitId: number;
    lessonName: string;
    lessonSummary: string;
    vocabulary: {id: string; word: string; definition: string}[];
  };
}> = ({lessonPracticeData}) => {
  const [selectedOption, setSelectedOption] = useState<PracticeOption | null>(
    null
  );

  console.log('selectedOption', selectedOption);

  return (
    <>
      <Typography variant="h2">
        Lesson Practice for {lessonPracticeData.lessonName}
      </Typography>
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
        showVocabularyOption={lessonPracticeData.vocabulary.length > 0}
      />
      {selectedOption === 'summary' && (
        <GenericStudentLessonSummary
          lessonSummary={lessonPracticeData.lessonSummary}
        />
      )}
      {selectedOption === 'student-work-summary' && (
        <StudentWorkLessonSummary
          lessonId={lessonPracticeData.lessonId}
          unitId={lessonPracticeData.unitId}
        />
      )}
      {selectedOption === 'flashcards' &&
        lessonPracticeData.vocabulary.length > 0 && (
          <VocabularyFlashcards vocabulary={lessonPracticeData.vocabulary} />
        )}
      {selectedOption === 'chat' && (
        <ChatWorkspace
          modelParameters={baseModelParameters}
          clientType={AiChatClientTypes.AI_TUTOR}
        />
      )}
      {selectedOption === 'parsons-problem' && <ParsonsProblem />}
    </>
  );
};
