// Stub for @cdo/apps/lab2/views/components/AiTutorChat.
//
// The real component wraps aichat's ChatWorkspace: a 266-file closure that
// registers reducers into the apps global store at import time. It cannot be
// rendered outside that store, so this is a fake, not a port. Anything the
// chat panel draws is out of scope for dev-shell/Studio parity.
//
// TODO: drop this once the host injects the chat component instead of the
// feature importing it.

import {useCallback, useRef, useState} from 'react';

interface FakeChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface AiTutorChatProps {
  hiddenContextCallback?: () => Promise<string>;
  aiTutorSystemPrompt?: string;
  aiTutorChatButtonData?: unknown[];
  isLessonDeepDive?: boolean;
  lessonId?: number;
  initialWelcomeMessage?: string;
}

const CANNED_REPLIES = [
  'Great question! Think about how the lesson defined that term — how would you explain it in your own words?',
  "You're close. One thing to reconsider: what does the model do when its training data is incomplete?",
  'Exactly right. Want to try applying that idea to one of the practice problems next?',
];

export default function AiTutorChat({initialWelcomeMessage}: AiTutorChatProps) {
  const [messages, setMessages] = useState<FakeChatMessage[]>([
    {
      role: 'assistant',
      text:
        initialWelcomeMessage ??
        "Hi! I'm your tutor (dev-shell fake). What would you like to review?",
    },
  ]);
  const [draft, setDraft] = useState('');
  const [waiting, setWaiting] = useState(false);
  const replyIndex = useRef(0);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || waiting) return;
    setMessages(m => [...m, {role: 'user', text}]);
    setDraft('');
    setWaiting(true);
    setTimeout(() => {
      const reply =
        CANNED_REPLIES[replyIndex.current++ % CANNED_REPLIES.length];
      setMessages(m => [...m, {role: 'assistant', text: reply}]);
      setWaiting(false);
    }, 600);
  }, [draft, waiting]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 320,
        gap: 8,
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              background: m.role === 'user' ? '#5b3d88' : '#3a4048',
              color: '#fff',
              borderRadius: 12,
              padding: '8px 12px',
              maxWidth: '80%',
            }}
          >
            {m.text}
          </div>
        ))}
        {waiting && <div aria-label="Waiting for response">Thinking…</div>}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault();
          send();
        }}
        style={{display: 'flex', gap: 8}}
      >
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Ask your tutor…"
          aria-label="Chat message"
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #4a5058',
            background: '#292f36',
            color: '#fff',
          }}
        />
        <button type="submit" disabled={!draft.trim() || waiting}>
          Send
        </button>
      </form>
    </div>
  );
}
