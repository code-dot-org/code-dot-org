import React, {FC, useCallback} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';

import {AssessmentQuestionResult, LessonDeepDiveData} from './types';

import styles from './lesson-deep-dive-tutor-chat.module.scss';

interface LessonDeepDiveTutorChatProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  assessmentAnalysis: AssessmentQuestionResult[];
}

const LessonDeepDiveTutorChat: FC<LessonDeepDiveTutorChatProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  assessmentAnalysis,
}) => {
  const hiddenContextCallback = useCallback(async () => '', []);

  const getSystemPrompt = () => {
    const vocabList = vocabulary
      .map(v => `- ${v.word}: ${v.definition}`)
      .join('\n');
    return [
      `The student has just finished a lesson titled "${lessonName}".`,
      '',
      'Lesson summary:',
      lessonSummary,
      ...(vocabulary.length > 0
        ? ['', 'Vocabulary from this lesson:', vocabList]
        : []),
      ...(assessmentAnalysis.length > 0
        ? [
            '',
            'Assessment question results:',
            JSON.stringify(assessmentAnalysis, null, 2),
          ]
        : []),
      '',
      'Help the student review and reflect on what they learned in the lesson and provide guidance for their misunderstandings. Coach them on how to improve assessment question answers if they were not correct.',
    ].join('\n');
  };

  return (
    <div className={styles.container}>
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
