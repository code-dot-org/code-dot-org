import React, {useEffect, useState} from 'react';

import {getStudentChatHistory} from '@cdo/apps/aichat/aichatApi';
import {getCurrentLevel} from '@cdo/apps/code-studio/progressReduxSelectors';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {ChatEvent} from '../types';

import ChatWithModel from './ChatWithModel';

const StudentChatHistory: React.FunctionComponent = () => {
  const [studentChatEvents, setStudentChatEvents] = useState<ChatEvent[]>([]);
  const viewAsUserId = useAppSelector(state => state.progress.viewAsUserId);

  const currentLevel = useAppSelector(state => getCurrentLevel(state));
  const scriptId = useAppSelector(
    state => state.progress.scriptId || undefined
  );

  useEffect(() => {
    if (viewAsUserId) {
      const studentChatHistory = viewAsUserId
        ? getStudentChatHistory(
            viewAsUserId,
            currentLevel.id,
            scriptId,
            undefined
          )
        : [];
      setStudentChatEvents(studentChatHistory);
    }
  }, [viewAsUserId, currentLevel.id, scriptId]);

  return (
    <ChatWithModel
      items={studentChatEvents}
      showWaitingAnimation={() => null}
    />
  );
};

export default StudentChatHistory;
