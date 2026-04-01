import {Typography} from '@mui/material';
import React, {FC, useCallback} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';

import {LessonDeepDiveData} from './types';

import styles from './lesson-deep-dive-tutor-chat.module.scss';

interface LessonDeepDiveTutorChatProps {
  lessonName: string;
  lessonSummary: string;
  vocabulary: LessonDeepDiveData['vocabulary'];
}

const LessonDeepDiveTutorChat: FC<LessonDeepDiveTutorChatProps> = ({
  lessonName,
  lessonSummary,
  vocabulary,
}) => {
  const hiddenContextCallback = useCallback(async () => {
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
      '',
      'Help the student review and reflect on what they learned and provide guidance for their misunderstandings.',
    ].join('\n');
  }, [lessonName, lessonSummary, vocabulary]);

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.header}>
        ⚠️ 🛠️ Chat History is broken because that fetch expects a levelId or
        projectId, which we don't have...
      </Typography>
      <AiTutorChat
        hiddenContextCallback={hiddenContextCallback}
        aiTutorChatButtonData={[]}
      />
    </div>
  );
};

export default LessonDeepDiveTutorChat;
