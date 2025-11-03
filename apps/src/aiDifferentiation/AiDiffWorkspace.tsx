import React, {useCallback, useEffect, useState} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aichat/redux/thunks';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import AiDiffNotificationList from './notifications/AiDiffNotificationList';
import {ChatThread, chatThreadValidator, Context, ChatPrompt} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses?: string[];
  unreadNotificationCount: number;
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
  unreadNotificationCount,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>();
  const [initialThreadPrompt, setInitialThreadPrompt] =
    useState<ChatPrompt | null>(null);

  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  const dispatch = useAppDispatch();

  async function asyncFetchThreads(): Promise<ChatThread[]> {
    const response = await HttpClient.fetchJson<ChatThread[]>(
      `/aidiff_threads`,
      {},
      chatThreadValidator
    );
    return response.value;
  }

  const fetchThreads = useCallback(() => {
    asyncFetchThreads().then(response => {
      setThreads(
        response.sort((a, b) => {
          return a.updatedAt > b.updatedAt ? -1 : 1;
        })
      );
    });
  }, [setThreads]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const aiPromptOutsideChatClicked = useCallback(
    (label: string, prompt: string) => {
      setShowNotifications(false);
      setInitialThreadPrompt({
        label: label,
        prompt: prompt,
      });
      dispatch(fetchThreadMessages({thread: 0}));
    },
    [dispatch]
  );

  return (
    <div className={style.aiDiffWorkspace}>
      <AiDiffSidebar
        threads={threads}
        setShowNotifications={setShowNotifications}
        showNotifications={showNotifications}
        unreadNotificationCount={unreadNotificationCount}
      />
      {showNotifications && experiments.isEnabled('teacher-notifications') ? (
        <AiDiffNotificationList aiPromptClick={aiPromptOutsideChatClicked} />
      ) : (
        <AiDiffChat
          context={context}
          scriptName={scriptName}
          curriculumCourses={curriculumCourses}
          threadFetchCallback={fetchThreads}
          initialThreadPrompt={initialThreadPrompt}
          setInitialThreadPrompt={setInitialThreadPrompt}
        />
      )}
    </div>
  );
};

export default AiDiffWorkSpace;
