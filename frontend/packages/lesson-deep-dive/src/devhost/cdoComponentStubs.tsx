// React component stubs for host-owned components. Each renders a usable
// stand-in so the full deep-dive flow is navigable in the dev host; the real
// implementations stay in apps/ and are resolved by the Studio host at
// runtime.

import {useDroppable} from '@dnd-kit/core';
import React, {useCallback, useRef, useState} from 'react';

import type {ReactFlowSketchLabSources} from './hostTypes';

// --------------------------------------------------------------------------
// @cdo/apps/templates/SafeMarkdown — plain-text rendering with bold support.
// The real component pipes through remark + rehype sanitization.
// --------------------------------------------------------------------------

export function SafeMarkdown({
  markdown,
}: {
  markdown: string;
  unwrapped?: boolean;
  localized?: boolean;
}) {
  const parts = markdown.split(/(\*\*[^*]+\*\*)/g);
  return (
    <div style={{whiteSpace: 'pre-wrap'}}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// @cdo/apps/aichat/views/WaitingAnimation
// --------------------------------------------------------------------------

export function WaitingAnimation({shouldDisplay}: {shouldDisplay: boolean}) {
  if (!shouldDisplay) return null;
  return <div aria-label="Waiting for response">Thinking…</div>;
}

// --------------------------------------------------------------------------
// @cdo/apps/jsonVideo/TutorVideo
// --------------------------------------------------------------------------

export function TutorVideo({href}: {href: string}) {
  const [hasError, setHasError] = useState(false);
  if (hasError) {
    return <p>Video could not be loaded ({href}).</p>;
  }
  return (
    <video
      controls
      src={href}
      style={{width: '100%', maxHeight: 360}}
      onError={() => setHasError(true)}
    >
      <track kind="captions" label="English captions" srcLang="en" default />
    </video>
  );
}

// --------------------------------------------------------------------------
// @cdo/apps/codebridge/FileBrowser/Droppable — same dnd-kit wrapper shape.
// --------------------------------------------------------------------------

export function Droppable({
  children,
  data,
  Component = 'div',
  className,
}: {
  children: React.ReactNode;
  data: {id: string | number} & Record<string, unknown>;
  Component?: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const {setNodeRef} = useDroppable({id: data.id, data});
  return React.createElement(Component, {ref: setNodeRef, className}, children);
}

// --------------------------------------------------------------------------
// @cdo/apps/lab2/views/components/AiTutorChat — self-contained fake chat.
// The real component wraps aichat's ChatWorkspace (Redux slices, async
// completion protocol, chat history, moderation states).
// --------------------------------------------------------------------------

interface FakeChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const CANNED_REPLIES = [
  'Great question! Think about how the lesson defined that term — how would you explain it in your own words?',
  "You're close. One thing to reconsider: what does the model do when its training data is incomplete?",
  'Exactly right. Want to try applying that idea to one of the practice problems next?',
];

export default function AiTutorChat({
  aiTutorSystemPrompt,
  initialWelcomeMessage,
}: {
  hiddenContextCallback?: () => Promise<string>;
  aiTutorSystemPrompt?: string;
  aiTutorChatButtonData?: unknown[];
  isLessonDeepDive?: boolean;
  lessonId?: number;
  initialWelcomeMessage?: string;
}) {
  const [messages, setMessages] = useState<FakeChatMessage[]>([
    {
      role: 'assistant',
      text:
        initialWelcomeMessage ??
        "Hi! I'm your tutor (dev-host fake). What would you like to review?",
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
      title={aiTutorSystemPrompt ? 'system prompt supplied' : undefined}
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
        {waiting && <WaitingAnimation shouldDisplay />}
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

// --------------------------------------------------------------------------
// @cdo/apps/sketchlab/reactFlow/components/ReactFlowCanvas — click-to-stamp
// stand-in that honors the updateSources contract so the whiteboard submit
// gate (nodes.length > 0) and snapshot upload flow are exercisable.
// --------------------------------------------------------------------------

interface StampedDot {
  x: number;
  y: number;
}

export function ReactFlowCanvas({
  updateSources,
  readOnly,
}: {
  updateSources: (sources: ReactFlowSketchLabSources) => void;
  levelName?: string;
  initialNodes?: unknown[];
  initialEdges?: unknown[];
  initialViewport?: unknown;
  colorMode?: string;
  readOnly?: boolean;
}) {
  const [dots, setDots] = useState<StampedDot[]>([]);

  const stamp = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (readOnly) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const next = [
        ...dots,
        {x: e.clientX - rect.left, y: e.clientY - rect.top},
      ];
      setDots(next);
      updateSources({source: {nodes: next, edges: []}});
    },
    [dots, readOnly, updateSources],
  );

  return (
    <button
      type="button"
      onClick={stamp}
      aria-label="Whiteboard canvas (dev-host stand-in — click to draw)"
      style={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        minHeight: 280,
        background: '#1e2329',
        border: '1px dashed #4a5058',
        borderRadius: 8,
        cursor: readOnly ? 'default' : 'crosshair',
        overflow: 'hidden',
        padding: 0,
      }}
    >
      {dots.length === 0 && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: '#8a9199',
          }}
        >
          Click to draw (ReactFlowCanvas stand-in)
        </span>
      )}
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: d.x - 6,
            top: d.y - 6,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#a374d6',
          }}
        />
      ))}
    </button>
  );
}
