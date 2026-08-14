import React, {useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';
import UserMessageEditor from '@cdo/apps/aiComponentLibrary/userMessageEditor/UserMessageEditor';

import {ChatItem} from '../agent/TutorSession';

import moduleStyles from './chat-panel.module.scss';

interface ChatPanelProps {
  items: ChatItem[];
  busy: boolean;
  onSubmit: (text: string) => void;
}

/**
 * Chat column: message history plus composer. Built from the same
 * aiComponentLibrary pieces the aichat lab uses, rather than aichat's
 * ChatWorkspace, because ChatWorkspace owns its conversation loop (submit
 * posts to the aichat backend) and this page's turns are driven by the MCP
 * agent loop instead.
 */
const ChatPanel: React.FunctionComponent<ChatPanelProps> = ({
  items,
  busy,
  onSubmit,
}) => {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [items, busy]);

  return (
    <div className={moduleStyles.panel}>
      <div className={moduleStyles.messages} ref={scrollRef}>
        {items.map(item =>
          item.kind === 'message' ? (
            <ChatMessage
              key={item.id}
              text={item.text}
              role={item.role === 'user' ? Role.USER : Role.ASSISTANT}
            />
          ) : (
            <div key={item.id} className={moduleStyles.statusChip}>
              {item.text}
            </div>
          )
        )}
        {busy && (
          <div className={moduleStyles.statusChip} aria-live="polite">
            Tutor is thinking…
          </div>
        )}
      </div>
      <div className={moduleStyles.composer}>
        <UserMessageEditor
          userMessage={draft}
          onChange={setDraft}
          disabled={busy}
          customPlaceholder="Ask your tutor anything"
          onSubmit={text => {
            setDraft('');
            onSubmit(text);
          }}
        />
      </div>
    </div>
  );
};

export default ChatPanel;
