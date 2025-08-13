import React from 'react';

import AiDiffChat from './AiDiffChat';
import AiDiffSidebar from './AiDiffSidebar';
import {Context} from './types';

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
  return (
    <div className={style.aiDiffWorkspace}>
      {showSidebar && <AiDiffSidebar />}
      <AiDiffChat
        context={context}
        scriptName={scriptName}
        curriculumCourses={curriculumCourses}
      />
    </div>
  );
};

export default AiDiffWorkSpace;
