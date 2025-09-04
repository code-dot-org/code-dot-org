import React, {useCallback, useEffect, useState} from 'react';

import experiments from '@cdo/apps/util/experiments';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import AiDiffNotificationList from './notifications/AiDiffNotificationList';
import {
  ChatItem,
  ChatThread,
  chatThreadValidator,
  chatThreadMessagesValidator,
  Context,
  ChatPrompt,
} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses?: string[];
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>();
  const [threadMessages, setThreadMessages] = useState<ChatItem[]>();
  const [threadId, setThreadId] = useState<number>(0);
  const [keyId, setKeyId] = useState<number>(0);
  const [initialThreadPrompt, setInitialThreadPrompt] =
    useState<ChatPrompt | null>(null);

  const [showNotifications, setShowNotifications] = useState<boolean>(false);

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

  async function asyncFetchThreadMessages(thread: number): Promise<ChatThread> {
    const response = await HttpClient.fetchJson<ChatThread>(
      `/aidiff_threads/${thread}`,
      {},
      chatThreadMessagesValidator
    );
    return response.value;
  }

  const fetchThreadMessages = useCallback(
    (thread: number) => {
      if (thread === 0) {
        setThreadMessages([]);
        setThreadId(thread);
        // changing the keyId resets the component state.
        // if key is already 0 (i.e. starting a new thread from a new thread)
        // then we need to alternate to a different key value to reset state
        // -1 is safe because it won't accidentally match a threadID value
        if (keyId === 0) {
          setKeyId(-1);
        } else {
          setKeyId(thread);
        }
      } else {
        asyncFetchThreadMessages(thread).then(response => {
          setThreadMessages(response.messages);
          setThreadId(thread);
          setKeyId(thread);
        });
      }
    },
    [setThreadMessages, keyId]
  );

  const aiPromptOutsideChatClicked = useCallback(
    (label: string, prompt: string) => {
      setShowNotifications(false);
      setInitialThreadPrompt({
        label: label,
        prompt: prompt,
      });
      fetchThreadMessages(0);
    },
    [fetchThreadMessages]
  );

  return (
    <div className={style.aiDiffWorkspace}>
      <AiDiffSidebar
        threads={threads}
        selectedThreadId={threadId}
        threadSelectCallback={fetchThreadMessages}
        setShowNotifications={setShowNotifications}
        showNotifications={showNotifications}
      />
      {showNotifications && experiments.isEnabled('teacher-notifications') ? (
        <AiDiffNotificationList aiPromptClick={aiPromptOutsideChatClicked} />
      ) : (
        <AiDiffChat
          context={context}
          scriptName={scriptName}
          curriculumCourses={curriculumCourses}
          threadFetchCallback={fetchThreads}
          threadMessages={threadMessages}
          key={keyId}
          threadId={threadId}
          setThreadId={setThreadId}
          initialThreadPrompt={initialThreadPrompt}
          setInitialThreadPrompt={setInitialThreadPrompt}
        />
      )}
    </div>
  );
};

export default AiDiffWorkSpace;
