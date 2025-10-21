import React from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {commonI18n} from '@cdo/apps/types/locale';

import style from './ai-differentiation.module.scss';

interface AiDiffChatFooterProps {
  onSubmit: (msg: string) => void;
  waiting: boolean;
  userMessageEditorRef?: React.RefObject<HTMLTextAreaElement>;
}

const AiDiffChatFooter: React.FC<AiDiffChatFooterProps> = ({
  onSubmit,
  waiting,
  userMessageEditorRef,
}) => {
  return (
    <div className={style.chatFooter}>
      <UserMessageEditor
        ref={userMessageEditorRef}
        onSubmit={onSubmit}
        disabled={waiting}
        customPlaceholder={commonI18n.aiDifferentiation_write_message()}
      />
    </div>
  );
};

export default AiDiffChatFooter;
