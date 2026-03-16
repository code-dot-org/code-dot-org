import {Typography} from '@mui/material';
import React, {FC, useState} from 'react';

import ChatWorkspace from '@cdo/apps/aichat/views/ChatWorkspace';
import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import BonusLevels from '@cdo/apps/code-studio/components/lessonExtras/BonusLevels';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {baseModelParameters} from '../../hooks/useAiTutorModelParameters';

import GenericStudentLessonSummary from './GenericStudentLessonSummary';
import PracticeOptions from './PracticeOptions';
import VocabularyFlashcards from './VocabularyFlashcards';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';

type PracticeOption = 'summary' | 'flashcards' | 'chat' | 'bonus-levels' | null;

type Level = {
  activity_section_id: number;
  actvity_section_position: number;
  assessment: boolean;
  bonus: boolean;
  chapter: number;
  created_at: string;
  id: number;
  named_level: string | null;
  position: number;
  properties: {
    level_keys: string[];
    progression: string;
  };
  script_id: number;
  seed_key: string | null;
  stage_id: number;
  updated_at: string;
};

export const LessonPractice: FC<{
  lessonName: string;
  lessonSummary: string;
  vocabulary: {id: string; word: string; definition: string}[];
  bonusLevels?: {
    lessonNumber: number;
    levels: Level[];
  };
  sectionId?: number;
  userId?: number;
}> = ({
  lessonName,
  lessonSummary,
  vocabulary,
  bonusLevels,
  sectionId,
  userId,
}) => {
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
        showVocabularyOption={vocabulary && vocabulary.length > 0}
        showBonusLevelsOption={!!(bonusLevels && bonusLevels.levels.length > 0)}
      />
      {selectedOption === 'summary' && (
        <GenericStudentLessonSummary lessonSummary={lessonSummary} />
      )}
      {selectedOption === 'flashcards' &&
        vocabulary &&
        vocabulary.length > 0 && (
          <VocabularyFlashcards vocabulary={vocabulary} />
        )}
      {selectedOption === 'bonus-levels' &&
        !!(bonusLevels && bonusLevels.levels.length > 0) && (
          <BonusLevels
            bonusLevels={[bonusLevels]}
            sectionId={sectionId}
            userId={userId}
          />
        )}
      {selectedOption === 'chat' && (
        <ChatWorkspace
          modelParameters={baseModelParameters}
          clientType={AiChatClientTypes.AI_TUTOR}
        />
      )}
    </>
  );
};
