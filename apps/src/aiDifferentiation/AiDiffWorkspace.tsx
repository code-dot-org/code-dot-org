import React, {useCallback, useEffect, useState} from 'react';

import {fetchThreadMessages} from '@cdo/apps/aichat/redux/thunks';
import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import AiDiffNotificationList from './notifications/AiDiffNotificationList';
import {ChatThread, chatThreadValidator, Context} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses?: string[];
  unreadNotificationCount: number;
  personalizationData?: PersonalizationData;
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
  unreadNotificationCount,
  personalizationData,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>();
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
      dispatch(
        fetchThreadMessages({
          contextType: context.type,
          thread: 0,
          initialThreadPrompt: {
            label: label,
            prompt: prompt,
          },
          curriculumCourses: curriculumCourses,
        })
      );
    },
    [dispatch, context, curriculumCourses]
  );

  return (
    <div className={style.aiDiffWorkspace}>
      <AiDiffSidebar
        context={context}
        threads={threads}
        setShowNotifications={setShowNotifications}
        showNotifications={showNotifications}
        unreadNotificationCount={unreadNotificationCount}
        curriculumCourses={curriculumCourses}
      />
      {showNotifications && experiments.isEnabled('teacher-notifications') ? (
        <AiDiffNotificationList aiPromptClick={aiPromptOutsideChatClicked} />
      ) : (
        <AiDiffChat
          context={context}
          scriptName={scriptName}
          threadFetchCallback={fetchThreads}
          personalizationData={personalizationData}
        />
      )}
    </div>
  );
};

export default AiDiffWorkSpace;
