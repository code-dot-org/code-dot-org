// Student-facing AI Lessons player.
//
// Layout: a persistent AI Tutor chat on the left, the current lab embedded
// directly on the right (no iframes — the real Lab2 React view).  No header
// progress bar; the AI Tutor narrates the journey and decides when the
// student has met the success criteria.
//
// Because the lab is in our React tree, we can pull the student's live
// source out of Redux and hand it to the tutor whenever they ask to be
// checked — there is no manual "paste your code" step.  Advancement is
// gated on `action === 'advance'` returned by the tutor's structured JSON
// output, so the student cannot skip past a checkpoint they haven't met.

import {Button as MuiButton} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import ChatMessage from '@cdo/apps/aiComponentLibrary/chatMessage/ChatMessage';
import {Role} from '@cdo/apps/aiComponentLibrary/chatMessage/types';

import EmbeddedLab from './EmbeddedLab';
import {
  generateTutorOpening,
  generateTutorReply,
  TutorAction,
  TutorMessage,
} from './tutor';
import {LessonPlan} from './types';
import {useAutoCheckOnRun} from './useAutoCheckOnRun';
import {useStudentWork} from './useStudentWork';

import styles from './aiLessons.module.scss';

interface StudentPageProps {
  lesson: LessonPlan;
}

type Phase = 'in-progress' | 'celebrate';

const StudentPage: React.FunctionComponent<StudentPageProps> = ({lesson}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('in-progress');
  const [history, setHistory] = useState<TutorMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const checkpoint = lesson.checkpoints[currentIndex];
  const liveWork = useStudentWork(checkpoint);

  // Seed an opening message whenever the active checkpoint changes.
  useEffect(() => {
    let cancelled = false;
    setHistory([]);
    setError(undefined);
    setBusy(true);
    (async () => {
      try {
        const reply = await generateTutorOpening(lesson, currentIndex);
        if (cancelled) return;
        setHistory([{role: 'tutor', text: reply.message}]);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson, currentIndex]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history, busy]);

  const handleAdvance = (action: TutorAction) => {
    if (action === 'advance' && currentIndex < lesson.checkpoints.length - 1) {
      setCurrentIndex(i => i + 1);
    } else if (action === 'celebrate' || action === 'advance') {
      setPhase('celebrate');
    }
  };

  const sendToTutor = async (studentText: string) => {
    const trimmed = studentText.trim();
    const nextHistory: TutorMessage[] = trimmed
      ? [...history, {role: 'student' as const, text: trimmed}]
      : history;
    setHistory(nextHistory);
    setBusy(true);
    setError(undefined);
    try {
      const reply = await generateTutorReply(
        lesson,
        currentIndex,
        nextHistory,
        liveWork
      );
      setHistory(h => [...h, {role: 'tutor' as const, text: reply.message}]);
      handleAdvance(reply.action);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleCheck = useCallback(() => {
    if (busy) return;
    sendToTutor(
      "I just ran my project — please check whether I've met the success criteria."
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, history, currentIndex, lesson, liveWork]);

  // Panels checkpoints have no source to evaluate; when the student presses
  // Continue on the last slide we just advance.  If this is the final
  // checkpoint of the lesson, fall through to the celebrate phase.
  const handlePanelsComplete = useCallback(() => {
    if (currentIndex < lesson.checkpoints.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setPhase('celebrate');
    }
  }, [currentIndex, lesson.checkpoints.length]);

  // Fire a check the moment the student hits Run/Play in the lab.
  useAutoCheckOnRun(handleCheck, !busy && phase === 'in-progress');

  if (phase === 'celebrate') {
    return (
      <div className={styles.celebrate}>
        <h1>You did it!</h1>
        <p>{lesson.title}</p>
        <p>{lesson.introduction}</p>
        <p>
          <a href="/ai_lessons">Back to lessons</a>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.studentPage}>
      <aside className={styles.tutorPanel}>
        <header className={styles.tutorHeader}>
          <div className={styles.lessonTitle}>{lesson.title}</div>
          <div className={styles.checkpointMeta}>
            Step {currentIndex + 1} of {lesson.checkpoints.length} ·{' '}
            {checkpoint.title}
          </div>
        </header>

        <div className={styles.transcript} ref={transcriptRef}>
          {history.map((m, i) => (
            <ChatMessage
              key={i}
              text={m.text}
              role={m.role === 'tutor' ? Role.ASSISTANT : Role.USER}
            />
          ))}
          {busy && <div className={styles.thinking}>Tutor is thinking…</div>}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        {checkpoint.labType !== 'panels' && (
          <div className={styles.composer}>
            <MuiButton
              variant="contained"
              color="primary"
              type="button"
              onClick={handleCheck}
              disabled={busy}
              fullWidth
            >
              Check my work
            </MuiButton>
            <div className={styles.muted} style={{fontSize: 12, marginTop: 8}}>
              {checkpoint.labType === 'music'
                ? 'Pressing Play in the lab also asks the tutor to check your work.'
                : 'Tap Check my work whenever you want the tutor to evaluate what you have so far.'}
            </div>
          </div>
        )}
      </aside>

      <main className={styles.labArea}>
        <EmbeddedLab
          key={checkpoint.id}
          checkpoint={checkpoint}
          onLabComplete={handlePanelsComplete}
        />
      </main>
    </div>
  );
};

export default StudentPage;
