import {Button, Typography} from '@mui/material';
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import {authoringApi, type TutorAction, type TutorEvent} from '../api';

import styles from './authoring.module.scss';

interface TutorDockProps {
  lessonId: string;
  /** The tutor may only jump to already-authored experiences. */
  onSelectExperience: (
    experienceId: string,
    input?: Record<string, unknown>,
  ) => void;
}

/** The player forwards stage/widget events into the tutor through this. */
export interface TutorDockHandle {
  push: (event: TutorEvent) => Promise<void>;
}

interface TutorLogEntry {
  id: number;
  from: 'learner' | 'tutor';
  text: string;
}

/**
 * Learner-time AI tutor, the mirror of the authoring agent: it never creates
 * anything, it selects and configures experiences the author already
 * published, via the same Experience runtime the deterministic path uses.
 * Online-only by design — turning it off leaves the lesson fully working.
 */
const TutorDock = forwardRef<TutorDockHandle, TutorDockProps>(
  function TutorDock({lessonId, onSelectExperience}, ref) {
    const [log, setLog] = useState<TutorLogEntry[]>([]);
    const [draft, setDraft] = useState('');
    const [busy, setBusy] = useState(false);
    const transcriptRef = useRef<TutorEvent[]>([]);
    const nextId = useRef(0);

    const append = (from: TutorLogEntry['from'], text: string) =>
      setLog(prev => [...prev, {id: nextId.current++, from, text}]);

    const act = (action: TutorAction) => {
      if (action.type === 'hint') {
        append('tutor', action.text);
      } else if (action.type === 'select_experience') {
        append('tutor', 'Let’s try this activity.');
        onSelectExperience(action.experienceId, action.input);
      } else if (action.text) {
        append('tutor', action.text);
      }
    };

    const sendEvent = async (event: TutorEvent) => {
      transcriptRef.current = [...transcriptRef.current, event];
      setBusy(true);
      try {
        act(await authoringApi.tutorTurn(lessonId, transcriptRef.current));
      } catch {
        append('tutor', 'The tutor is unavailable right now.');
      } finally {
        setBusy(false);
      }
    };

    useImperativeHandle(ref, () => ({push: sendEvent}));

    const sendMessage = async () => {
      const text = draft.trim();
      if (!text || busy) {
        return;
      }
      setDraft('');
      append('learner', text);
      await sendEvent({kind: 'learner_message', text});
    };

    return (
      <section className={styles.tutorDock} aria-label="AI tutor">
        <div className={styles.tutorLog}>
          {log.length === 0 && (
            <Typography variant="body2">
              Hi! I’m your AI tutor. Work through the activity and I’ll jump
              in, or ask me anything.
            </Typography>
          )}
          {log.map(entry => (
            <div
              key={entry.id}
              className={
                entry.from === 'learner'
                  ? styles.chatBubbleAuthor
                  : styles.chatBubbleAgent
              }
            >
              <Typography variant="body2">{entry.text}</Typography>
            </div>
          ))}
        </div>
        <div className={styles.tutorComposer}>
          <textarea
            aria-label="Message the AI tutor"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            size="small"
            disabled={busy || !draft.trim()}
            onClick={() => void sendMessage()}
          >
            Send
          </Button>
        </div>
      </section>
    );
  },
);

export default TutorDock;
