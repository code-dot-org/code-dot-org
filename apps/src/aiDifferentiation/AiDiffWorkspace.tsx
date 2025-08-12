import React, {useCallback, useEffect, useState} from 'react';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import {
  ChatItem,
  ChatThread,
  chatThreadValidator,
  chatThreadMessagesValidator,
  Context,
} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses?: string[];
  showSidebar?: boolean;
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
  showSidebar,
}) => {
  const [threads, setThreads] = useState<ChatThread[]>();
  const [threadMessages, setThreadMessages] = useState<ChatItem[]>();
  const [threadId, setThreadId] = useState<number>(0);

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
    if (showSidebar) {
      fetchThreads();
    }
  }, [showSidebar, fetchThreads]);

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
      } else {
        asyncFetchThreadMessages(thread).then(response => {
          setThreadMessages(response.messages);
          setThreadId(thread);
        });
      }
    },
    [setThreadMessages]
  );

  return (
    <div className={style.aiDiffWorkspace}>
      {showSidebar && (
        <AiDiffSidebar
          threads={threads}
          selectedThreadId={threadId}
          threadSelectCallback={fetchThreadMessages}
        />
      )}
      <AiDiffChat
        context={context}
        scriptName={scriptName}
        curriculumCourses={curriculumCourses}
        threadFetchCallback={showSidebar ? fetchThreads : () => {}}
        threadMessages={threadMessages}
        key={threadId}
        threadId={threadId}
      />
    </div>
  );
};

export default AiDiffWorkSpace;
