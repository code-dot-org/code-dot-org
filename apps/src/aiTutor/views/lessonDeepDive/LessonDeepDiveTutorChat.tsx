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

function buildGreeting(
  objectives: LessonDeepDiveData['objectives'],
  reflectionData: ReflectionData
): string {
  const needsWork = objectives.filter(o => {
    const v = reflectionData.objectiveReflections[o.id];
    return (
      v === LessonObjectiveReflectionValues.LOST ||
      v === LessonObjectiveReflectionValues.UNSURE
    );
  });

  const lines: string[] = ['Hi!'];

  if (needsWork.length > 0) {
    const listed = needsWork
      .map(o => `"${o.description}"`)
      .join(needsWork.length > 1 ? ' and ' : '');
    lines.push(`I can see you want to work on ${listed}.`);
  }

  if (reflectionData.struggle) {
    lines.push(`You mentioned: "${reflectionData.struggle}"`);
  }

  if (needsWork.length === 0 && !reflectionData.struggle) {
    lines.push(
      'You seem confident about everything in this lesson — great work! Ask me anything to go deeper or double-check your understanding.'
    );
  } else {
    lines.push('Ask me anything to get started!');
  }

  return lines.join(' ');
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
          ]
        : []),
      '',
      'Help the student review and reflect on what they learned and provide guidance for their misunderstandings.',
    ].join('\n');
  }, [lessonName, lessonSummary, vocabulary, objectives, reflectionData]);

  const greeting = reflectionData
    ? buildGreeting(objectives, reflectionData)
    : null;

  console.log('reflectionData:', reflectionData);
  console.log('greeting:', greeting);

  return (
    <div className={styles.container}>
      {greeting && (
        <div className={styles.greetingWrapper}>
          <div className={styles.greeting}>{greeting}</div>
        </div>
      )}
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
