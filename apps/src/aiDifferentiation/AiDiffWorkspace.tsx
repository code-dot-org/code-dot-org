import React from 'react';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import {ChatThread, Context} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffWorkSpaceProps {
  context: Context;
  scriptName?: string;
  curriculumCourses?: string[];
  showSidebar?: boolean;
  threads?: ChatThread[];
}

const AiDiffWorkSpace: React.FC<AiDiffWorkSpaceProps> = ({
  context,
  scriptName,
  curriculumCourses,
  showSidebar,
  threads,
}) => {
  return (
    <div className={style.aiDiffWorkspace}>
      {showSidebar && <AiDiffSidebar threads={threads} />}
      <AiDiffChat
        context={context}
        scriptName={scriptName}
        curriculumCourses={curriculumCourses}
      />
    </div>
  );
};

export default AiDiffWorkSpace;
