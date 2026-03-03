import Button from '@code-dot-org/component-library/button';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {FC} from 'react';

import AiTutorChat from '@cdo/apps/lab2/views/components/AiTutorChat';
import aiBotOutlineIcon from '@cdo/static/ai-bot-outline.png';

import {lessonReviewPrompts} from '../../suggestedPrompts';

// import {
//   AiTutorLegacyLabContextHelper,
//   AiTutorLegacyLabParams,
// } from './aiTutorContextHelper';

import styles from '@cdo/apps/aiTutor/views/lessonPractice/lesson-practice-ai-tutor.module.scss';

export const AiTutorContainer: FC<{
  vocabulary: {id: string; word: string; definition: string}[];
}> = ({vocabulary}) => {
  //   const analyticsData = {
  //     labType: labState.appType,
  //     channelId: labState.channelId,
  //     location: window.location.href,
  //     levelId: labState.serverLevelId,
  //     unitId: labState.serverScriptId,
  //   };

  const getHiddenContext = async (): Promise<string> => {
    const message = 'getHiddenContext was called from LessonPractice';
    console.log(message);
    return message;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img
          src={aiBotOutlineIcon}
          alt=""
          className={styles['mini-bot-icon']}
        />
        <Typography className={styles['header-text']} variant="body3">
          AI Tutor
        </Typography>
      </div>
      <AiTutorChat
        hiddenContextCallback={() => getHiddenContext()}
        aiTutorChatButtonData={lessonReviewPrompts}
      />
    </div>
  );
};
