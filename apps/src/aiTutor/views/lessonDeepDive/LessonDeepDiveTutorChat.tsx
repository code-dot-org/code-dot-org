import React, {FC, useCallback} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {
  LessonDeepDiveData,
  ReflectionData,
  AssessmentQuestionResult,
} from './types';

import styles from './lesson-deep-dive-tutor-chat.module.scss';

interface LessonDeepDiveTutorChatProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  assessmentAnalysis: AssessmentQuestionResult[];
  objectives: LessonDeepDiveData['objectives'];
  reflectionData: ReflectionData | null;
  welcomeMessage: string | null;
  welcomeLoading: boolean;
}

const LessonDeepDiveTutorChat: FC<LessonDeepDiveTutorChatProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  assessmentAnalysis,
  objectives,
  reflectionData,
  welcomeMessage,
  welcomeLoading,
}) => {
  const hiddenContextCallback = useCallback(async () => '', []);

  const getSystemPrompt = () => {
    let prompt = `You are a tutor helping a student review an Artificial Intelligence
    or Computer Science lesson. You should reinforce the concepts in the lesson, provide
    guidance for misunderstandings, and coach the student on how to improve their assessment question
    answers if they were not correct. Be specific and encouraging.
    The student has just finished a lesson titled "${lessonName}".
    'Lesson summary:'${lessonSummary}.`;

    const vocabList = vocabulary
      .map(v => `- ${v.word}: ${v.definition}`)
      .join('\n');

    if (vocabulary.length > 0) {
      prompt += `\nVocabulary from this lesson:\n${vocabList}`;
    }

    if (reflectionData) {
      prompt += `\nStudent reflection on lesson objectives:\n${objectives
        .map(o => {
          const rating = reflectionData.objectiveReflections[o.id];
          return `- "${o.description}": ${rating ?? 'not rated'}`;
        })
        .join('\n')}`;
    }

    if (assessmentAnalysis.length > 0) {
      prompt += `\nAssessment question results:\n${JSON.stringify(
        assessmentAnalysis,
        null,
        2
      )}`;
    }
    return prompt;
  };

  return (
    <div className={styles.container} data-theme="Dark">
      <div className={styles.welcomeMessage}>
        <div className={styles.botIconContainer}>
          <img src={aiBotOutlineIcon} alt="" className={styles.botIcon} />
        </div>
        {reflectionData === null ? (
          <p className={styles.welcomeMessageText}>
            {
              'Head back and share your reflection — it helps me give you a more personalized session!'
            }
          </p>
        ) : welcomeLoading ? (
          <div className={styles.welcomeLoading}>
            <Spinner size="medium" />
          </div>
        ) : (
          welcomeMessage && (
            <p className={styles.welcomeMessageText}>{welcomeMessage}</p>
          )
        )}
      </div>
      <AiTutorChat
        hiddenContextCallback={hiddenContextCallback}
        aiTutorSystemPrompt={getSystemPrompt()}
        aiTutorChatButtonData={[]}
        isLessonDeepDive={true}
        lessonId={lessonId}
      />
    </div>
  );
};

export default LessonDeepDiveTutorChat;
