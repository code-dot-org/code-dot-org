import {Button, Typography} from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {authoringApi, type AuthoringScope, type ChatMessage} from '../api';
import {activityFeedStore, type AuthoringServerEvent} from '../events';
import {useChatLog} from '../hooks';

import styles from './authoring.module.scss';

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

  const items = mergeLogAndFeed(log ?? [], feed);

  useEffect(() => {
    // Keep the newest activity in view as it streams in.
    logRef.current?.scrollTo({top: logRef.current.scrollHeight});
  }, [items.length]);

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
        <span className={styles.scopeChip}>
          <Typography variant="body4">{scopeLabel}</Typography>
        </span>
      </div>
      <div className={styles.sidebarLog} ref={logRef}>
        {items.map(item => (
          <SidebarItem key={item.key} item={item} />
        ))}
        {items.length === 0 && (
          <Typography variant="body2">
            Describe what learners should experience — “add a quick check for
            understanding here”, “make this more hands-on”, “use the Oceans
            activity where students train a model”.
          </Typography>
        )}
      </div>
      <div className={styles.sidebarComposer}>
        {quickActions}
        <div className={styles.composerRow}>
          <textarea
            aria-label="Message the AI author"
            value={draft}
            placeholder={`Ask about this ${scopeLabelKind(scope)}…`}
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
            disabled={sending || !draft.trim()}
            onClick={() => void send()}
          >
            Send
          </Button>
        </div>
      </div>
    </aside>
  );
}

type SidebarEntry =
  | {key: string; type: 'message'; message: ChatMessage}
  | {key: string; type: 'status'; text: string};

// The chat log is the durable record; agent-status events are ephemeral
// progress. Only statuses from turns still in flight trail the log, so
// finished turns don't replay their tool chatter under the final message.
function mergeLogAndFeed(
  log: ChatMessage[],
  feed: AuthoringServerEvent[],
): SidebarEntry[] {
  const entries: SidebarEntry[] = log.map(message => ({
    key: `m:${message.id}`,
    type: 'message',
    message,
  }));
  const finishedTurns = new Set(
    feed
      .filter(
        event =>
          event.type === 'agent-status' &&
          (event.status === 'done' || event.status === 'error'),
      )
      .map(event => (event.type === 'agent-status' ? event.turnId : '')),
  );
  feed.forEach((event, i) => {
    if (event.type !== 'agent-status' || finishedTurns.has(event.turnId)) {
      return;
    }
    if (event.status === 'tool' || event.status === 'text') {
      entries.push({
        key: `s:${i}:${event.turnId}`,
        type: 'status',
        text: event.detail ?? event.status,
      });
    }
  });
  return entries;
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
