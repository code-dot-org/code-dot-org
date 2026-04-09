import React, {FC, useCallback} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import {LessonDeepDiveData, ReflectionData} from './types';

import styles from './lesson-deep-dive-tutor-chat.module.scss';

interface LessonDeepDiveTutorChatProps {
  lessonId: number;
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
  objectives: LessonDeepDiveData['objectives'];
  reflectionData: ReflectionData | null;
}

const LessonDeepDiveTutorChat: FC<LessonDeepDiveTutorChatProps> = ({
  lessonId,
  lessonName,
  lessonSummary,
  vocabulary,
  objectives,
  reflectionData,
}) => {
  const hiddenContextCallback = useCallback(async () => {
    const vocabList = vocabulary
      .map(v => `- ${v.word}: ${v.definition}`)
      .join('\n');

    const needsWork = reflectionData
      ? objectives.filter(o => {
          const v = reflectionData.objectiveReflections[o.id];
          return (
            v === LessonObjectiveReflectionValues.LOST ||
            v === LessonObjectiveReflectionValues.UNSURE
          );
        })
      : [];

    return [
      `The student has just finished a lesson titled "${lessonName}".`,
      '',
      'Lesson summary:',
      lessonSummary,
      ...(vocabulary.length > 0
        ? ['', 'Vocabulary from this lesson:', vocabList]
        : []),
      ...(reflectionData
        ? [
            '',
            'Student reflection on lesson objectives:',
            ...objectives.map(o => {
              const rating = reflectionData.objectiveReflections[o.id];
              return `- "${o.description}": ${rating ?? 'not rated'}`;
            }),
            ...(reflectionData.struggle
              ? ['', `Student is struggling with: "${reflectionData.struggle}"`]
              : []),
            ...(reflectionData.success
              ? [`Student felt successful with: "${reflectionData.success}"`]
              : []),
            ...(needsWork.length > 0
              ? [
                  '',
                  'Prioritize these objectives the student found challenging:',
                  ...needsWork.map(o => `- ${o.description}`),
                ]
              : []),
            '',
            'Open the conversation by greeting the student warmly. Reference their specific struggles or objectives they marked as lost or unsure. Be specific and encouraging. Do not wait for the student to speak first.',
          ]
        : [
            '',
            'Help the student review and reflect on what they learned and provide guidance for their misunderstandings.',
          ]),
    ].join('\n');
  }, [lessonName, lessonSummary, vocabulary, objectives, reflectionData]);

  return (
    <div className={styles.container}>
      <AiTutorChat
        hiddenContextCallback={hiddenContextCallback}
        aiTutorChatButtonData={[]}
        isLessonDeepDive={true}
        lessonId={lessonId}
        autoGreet={!!reflectionData}
      />
    </div>
  );
};

export default LessonDeepDiveTutorChat;
