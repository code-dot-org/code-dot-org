import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useMemo, useState} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';

import {
  LessonDeepDiveData,
  ReflectionData,
  AssessmentQuestionResult,
} from '../types';

import styles from './chat.module.scss';

interface ChatProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  assessmentAnalysis: AssessmentQuestionResult[];
  objectives: LessonDeepDiveData['objectives'];
  reflectionData: ReflectionData | null;
}

const Chat: FC<ChatProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  assessmentAnalysis,
  objectives,
  reflectionData,
}) => {
  const hiddenContextCallback = useCallback(async () => '', []);

  const contextIntro = useMemo(() => {
    if (!reflectionData) return null;
    const struggling = objectives.find(
      o =>
        reflectionData.objectiveReflections[o.id] === 'lost' ||
        reflectionData.objectiveReflections[o.id] === 'unsure'
    );
    if (struggling) {
      return `In your reflection, you said ${struggling.description.toLowerCase()} was giving you trouble. Want to start there, or is there something else on your mind?`;
    }
    return `You did great on this lesson. Want to go deeper on any of the concepts, or is there something on your mind?`;
  }, [reflectionData, objectives]);

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

  const [introVisible, setIntroVisible] = useState(true);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.overline}>Chat</p>
        {contextIntro && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIntroVisible(v => !v)}
            aria-label={introVisible ? 'Hide context' : 'Show context'}
          >
            <FontAwesomeV6Icon
              iconName={introVisible ? 'angle-up' : 'angle-down'}
            />
          </button>
        )}
      </div>

      {contextIntro && introVisible && (
        <p className={styles.contextIntro}>{contextIntro}</p>
      )}

      <div className={styles.chatPanel}>
        <AiTutorChat
          hiddenContextCallback={hiddenContextCallback}
          aiTutorSystemPrompt={getSystemPrompt()}
          aiTutorChatButtonData={[]}
          isLessonDeepDive={true}
          lessonId={lessonId}
        />
      </div>
    </div>
  );
};

export default Chat;
