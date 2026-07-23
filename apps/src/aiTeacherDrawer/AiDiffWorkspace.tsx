import {asyncLoadSectionData} from '@code-dot-org/teacher-dashboard/redux';
import React, {useCallback, useEffect, useState} from 'react';

import {PersonalizationData} from '@cdo/apps/aiDifferentiation/hooks/useTeachingProfileData';
import {fetchThreadMessages} from '@cdo/apps/aiDifferentiation/redux';
import DCDO from '@cdo/apps/dcdo';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import ChatList from './ChatList';
import {ChatThread, chatThreadValidator, Context} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses: string[];
  personalizationData?: PersonalizationData;
  setArtifactMessageId?: (id: number) => void;
  showSidebar?: boolean;
  onSidebarChatSelect?: () => void;
  onViewThreads?: () => void;
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
  personalizationData,
  showSidebar = false,
  onSidebarChatSelect,
  onViewThreads,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>();

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
        response?.sort((a, b) => {
          return a.updatedAt > b.updatedAt ? -1 : 1;
        })
      );
    });
  }, [setThreads]);

  useEffect(() => {
    fetchThreads();
    dispatch(asyncLoadSectionData());
  }, [fetchThreads, dispatch]);

  const handleNewChat = useCallback(() => {
    dispatch(
      fetchThreadMessages({
        contextType: context.type,
        thread: 0,
        curriculumCourses: curriculumCourses,
      })
    );
  }, [dispatch, context, curriculumCourses]);

  const drawerIsEnabled =
    experiments.isEnabled('ai-diff-drawer') ||
    DCDO.get('ai-diff-drawer', false);

  if (showSidebar) {
    return (
      <div className={style.aiDiffWorkspace}>
        <ChatList
          context={context}
          threads={threads}
          curriculumCourses={curriculumCourses}
          fullWidth
          onChatSelect={onSidebarChatSelect}
        />
      </div>
    );
  }

  return (
    <div className={style.aiDiffWorkspace}>
      {!drawerIsEnabled && (
        <ChatList
          context={context}
          threads={threads}
          curriculumCourses={curriculumCourses}
        />
      )}
      <AiDiffChat
        context={context}
        scriptName={scriptName}
        threadFetchCallback={fetchThreads}
        onNewChat={handleNewChat}
        onViewThreads={onViewThreads}
        personalizationData={personalizationData}
      />
    </div>
  );
};

export default AiDiffWorkSpace;
