import {Button, CircularProgress, Typography} from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import Tags from '@code-dot-org/component-library/tags';

import {describeAgentTool} from '../agentActivityLabel';
import {computeFinishedTurns, findActiveTurn} from '../agentTurnStatus';
import {authoringApi, type AuthoringScope, type ChatMessage} from '../api';
import {activityFeedStore, type AuthoringServerEvent} from '../events';
import {useChatLog} from '../hooks';

import styles from './authoring.module.scss';

// Treat the reader as "at the bottom" within this slack so a fresh message
// landing exactly flush doesn't read as scrolled-away.
const NEAR_BOTTOM_PX = 48;

interface AuthorSidebarProps {
  scope: AuthoringScope;
  /** Human name for the scope chip, e.g. lesson or experience title. */
  scopeLabel: string;
  /** Extra quick actions above the composer (e.g. "Build this lesson"). */
  quickActions?: ReactNode;
}

/**
 * The AI author sidebar: pedagogical conversation in, curriculum out. The
 * author talks in teaching terms; the agent decides whether the result is
 * content, an existing level, or a generated widget. Live agent activity
 * streams in between messages so generation never looks like a black box.
 */
export default function AuthorSidebar({
  scope,
  scopeLabel,
  quickActions,
}: AuthorSidebarProps) {
  const {data: log} = useChatLog();
  const feed = useSyncExternalStore(
    activityFeedStore.subscribe,
    activityFeedStore.getSnapshot,
  );
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  // Whether the reader was at/near the bottom before this update — set on
  // scroll, read after a new entry lands. Defaults true so the log opens
  // scrolled to the newest message.
  const nearBottomRef = useRef(true);

  const {inScope, outOfScope} = mergeLogAndFeed(log ?? [], feed, scope);
  const [showEarlier, setShowEarlier] = useState(false);
  const items = showEarlier ? [...outOfScope, ...inScope] : inScope;
  const busy = sending || findActiveTurn(feed) !== undefined;

  useEffect(() => {
    const el = logRef.current;
    // Keep the newest activity in view as it streams in, but only if the
    // author was already reading near the bottom — don't yank them away
    // from history they scrolled up to read.
    if (el && nearBottomRef.current) {
      el.scrollTo({top: el.scrollHeight});
    }
  }, [items.length, busy]);

  const onLogScroll = () => {
    const el = logRef.current;
    if (!el) {
      return;
    }
    nearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;
  };

  const send = async () => {
    const message = draft.trim();
    if (!message || sending) {
      return;
    }
    setSending(true);
    setDraft('');
    try {
      await authoringApi.sendChat(scope, message);
    } catch {
      setDraft(message); // let the author retry rather than losing the text
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="AI author sidebar">
      <div className={styles.sidebarHeader}>
        <Typography variant="h6" component="h2">
          AI Author
        </Typography>
        <Tags tagsList={[{label: scopeLabel}]} size="s" />
      </div>
      {outOfScope.length > 0 && (
        <button
          type="button"
          className={styles.sidebarEarlierToggle}
          aria-expanded={showEarlier}
          onClick={() => setShowEarlier(v => !v)}
        >
          <Typography variant="body4" component="span">
            {showEarlier
              ? 'Hide earlier activity in other courses'
              : `Show ${outOfScope.length} earlier ${outOfScope.length === 1 ? 'message' : 'messages'} from other courses/lessons`}
          </Typography>
        </button>
      )}
      <div
        className={styles.sidebarLog}
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        onScroll={onLogScroll}
      >
        {items.map(item => (
          <SidebarItem key={item.key} item={item} />
        ))}
        {items.length === 0 && !busy && (
          <Typography variant="body2">
            Describe what learners should experience — “add a quick check for
            understanding here”, “make this more hands-on”, “use the Oceans
            activity where students train a model”.
          </Typography>
        )}
        {busy && (
          <div className={styles.workingIndicator} role="status">
            <CircularProgress size={14} thickness={5} />
            <Typography
              variant="body4"
              component="span"
              className={styles.workingIndicatorText}
            >
              Working…
            </Typography>
          </div>
        )}
      </div>
      <div className={styles.sidebarComposer}>
        {quickActions}
        <div className={styles.composerRow}>
          <textarea
            aria-label="Message the AI author"
            value={draft}
            placeholder={`Ask about this ${scopeLabelKind(scope)}…`}
            disabled={busy}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={busy || !draft.trim()}
            onClick={() => void send()}
          >
            {busy ? 'Working…' : 'Send'}
          </Button>
        </div>
      </div>
    </aside>
  );
}

type SidebarEntry =
  | {key: string; type: 'message'; message: ChatMessage}
  | {key: string; type: 'status'; text: string};

// A fresh author opening any screen used to see the WHOLE session transcript
// — every course, every lesson, including courses since removed from the
// catalog — which reads as broken rather than as history. At the catalog
// screen there is no current course to match against, so nothing is in
// scope there either (the empty-state hint takes over; full history is
// still one click away via "earlier activity"). Within a course, a message
// is in scope when its own courseId matches; narrow further to the current
// lesson once one is selected, but keep course-wide messages (no lessonId —
// e.g. "outline this course") visible at any lesson under it.
function isInScope(
  messageScope: AuthoringScope | undefined,
  currentScope: AuthoringScope,
): boolean {
  if (!currentScope.courseId || messageScope?.courseId !== currentScope.courseId) {
    return false;
  }
  if (!currentScope.lessonId || !messageScope.lessonId) {
    return true;
  }
  return messageScope.lessonId === currentScope.lessonId;
}

// The chat log is the durable record; agent-status events are ephemeral
// progress. Only statuses from turns still in flight trail the log, so
// finished turns don't replay their tool chatter under the final message.
// Out-of-scope entries are returned separately rather than dropped — the
// author can still open them via "earlier activity in other courses".
function mergeLogAndFeed(
  log: ChatMessage[],
  feed: AuthoringServerEvent[],
  currentScope: AuthoringScope,
): {inScope: SidebarEntry[]; outOfScope: SidebarEntry[]} {
  const inScope: SidebarEntry[] = [];
  const outOfScope: SidebarEntry[] = [];
  for (const message of log) {
    const entry: SidebarEntry = {
      key: `m:${message.id}`,
      type: 'message',
      message,
    };
    (isInScope(message.scope, currentScope) ? inScope : outOfScope).push(
      entry,
    );
  }
  const finishedTurns = computeFinishedTurns(feed);
  // Live status chatter is always for the turn just sent from THIS screen —
  // always in scope, never worth hiding behind the earlier-activity toggle.
  feed.forEach((event, i) => {
    if (event.type !== 'agent-status' || finishedTurns.has(event.turnId)) {
      return;
    }
    if (event.status === 'tool') {
      inScope.push({
        key: `s:${i}:${event.turnId}`,
        type: 'status',
        text: describeAgentTool(event.detail ?? event.status),
      });
    } else if (event.status === 'text') {
      inScope.push({
        key: `s:${i}:${event.turnId}`,
        type: 'status',
        text: event.detail ?? event.status,
      });
    }
  });
  return {inScope, outOfScope};
}

function SidebarItem({item}: {item: SidebarEntry}) {
  if (item.type === 'status') {
    return (
      <div className={styles.chatBubbleStatus}>
        <Typography variant="body4">{item.text}</Typography>
      </div>
    );
  }
  const {message} = item;
  const className =
    message.role === 'author'
      ? styles.chatBubbleAuthor
      : message.role === 'agent'
        ? styles.chatBubbleAgent
        : styles.chatBubbleStatus;
  return (
    <div className={className}>
      <Typography variant="body2" component="div">
        {message.text}
      </Typography>
    </div>
  );
}

function scopeLabelKind(scope: AuthoringScope): string {
  if (scope.experienceId) {
    return 'activity';
  }
  if (scope.lessonId) {
    return 'lesson';
  }
  if (scope.unitId) {
    return 'unit';
  }
  if (scope.courseId) {
    return 'course';
  }
  return 'curriculum';
}
