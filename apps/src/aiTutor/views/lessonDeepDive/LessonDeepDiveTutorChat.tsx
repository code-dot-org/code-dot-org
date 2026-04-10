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
  const hiddenContextCallback = useCallback(async () => {
    const vocabList = vocabulary
      .map(v => `- ${v.word}: ${v.definition}`)
      .join('\n');

    const attempted = assessmentAnalysis.filter(q => q.attempts > 0);
    const assessmentLines = attempted.map((q, i) => {
      const status = q.correct ? 'correct' : 'incorrect';
      return `- Question ${i + 1}: ${q.attempts} attempt${q.attempts === 1 ? '' : 's'}, ${status}`;
    });

    return [
      `The student has just finished a lesson titled "${lessonName}".`,
      '',
      'Lesson summary:',
      lessonSummary,
      ...(vocabulary.length > 0
        ? ['', 'Vocabulary from this lesson:', vocabList]
        : []),
      ...(assessmentLines.length > 0
        ? ['', 'Assessment question results:', ...assessmentLines]
        : []),
      '',
      'Help the student review and reflect on what they learned and provide guidance for their misunderstandings.',
    ].join('\n');
  }, [lessonName, lessonSummary, vocabulary, assessmentAnalysis]);

  return (
    <div className={styles.container}>
      <AiTutorChat
        hiddenContextCallback={hiddenContextCallback}
        aiTutorChatButtonData={[]}
        isLessonDeepDive={true}
        lessonId={lessonId}
      />
    </div>
  );
};

export default LessonDeepDiveTutorChat;
