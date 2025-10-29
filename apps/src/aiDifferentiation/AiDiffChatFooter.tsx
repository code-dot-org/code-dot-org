import React, {Dispatch, SetStateAction} from 'react';

import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';
import {commonI18n} from '@cdo/apps/types/locale';

import style from './ai-differentiation.module.scss';

interface AiDiffChatFooterProps {
  userMessage: string;
  setUserMessage: Dispatch<SetStateAction<string>>;
  onSubmit: (msg: string) => void;
  waiting: boolean;
  userMessageEditorRef?: React.RefObject<HTMLTextAreaElement>;
}

const AiDiffChatFooter: React.FC<AiDiffChatFooterProps> = ({
  userMessage,
  setUserMessage,
  onSubmit,
  waiting,
  userMessageEditorRef,
}) => {
  return (
    <div className={style.chatFooter}>
      <UserMessageEditor
        userMessage={userMessage}
        setUserMessage={setUserMessage}
        ref={userMessageEditorRef}
        onSubmit={onSubmit}
        disabled={waiting}
        customPlaceholder={commonI18n.aiDifferentiation_write_message()}
      />
    </div>
  );
};

export default AiDiffChatFooter;
