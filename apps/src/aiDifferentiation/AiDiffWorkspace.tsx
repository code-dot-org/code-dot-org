import React, {useCallback, useEffect, useState} from 'react';

import HttpClient from '../util/HttpClient';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import {ChatThread, chatThreadValidator, Context} from './types';

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

  return (
    <div className={style.aiDiffWorkspace}>
      {showSidebar && <AiDiffSidebar threads={threads} />}
      <AiDiffChat
        context={context}
        scriptName={scriptName}
        curriculumCourses={curriculumCourses}
        threadFetchCallback={showSidebar ? fetchThreads : () => {}}
      />
    </div>
  );
};

export default AiDiffWorkSpace;
