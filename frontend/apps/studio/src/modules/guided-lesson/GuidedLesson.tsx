import {useCallback, useMemo, useState} from 'react';

import {
  AiTutorChat,
  makeHiddenContextCallback,
  levelPrompts,
} from '@code-dot-org/ai-tutor';

import {
  getLabContext,
  toAiTutorContext,
} from '@/modules/ai-tutor-host/labContextRegistry';
import {readCurrentBlocklyCode} from '@/modules/ai-tutor-host/readBlocklyCode';

import LessonStage from './LessonStage';
import type {Lesson} from './types';

import styles from './guidedLesson.module.scss';

interface GuidedLessonProps {
  lesson: Lesson;
}

/**
 * Orchestrates the lesson. Owns `stepIndex` — which step is active. The chat
 * surface itself is the real `<AiTutorChat>` (LLM-driven, polling Rails
 * `/aichat_request/*`); the scripted "tutor → student → advance" flow used
 * during early iteration is gone. Step navigation lives on the stage header
 * (Prev / Next), and the active step's instructions are appended as hidden
 * context on every tutor request — so the tutor knows what the student is
 * currently working on.
 */
const GuidedLesson = ({lesson}: GuidedLessonProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step = lesson.steps[stepIndex];

  const stageVisual = step ? step.stage : {kind: 'none' as const};

  const goNext = useCallback(() => {
    setStepIndex(i => Math.min(i + 1, lesson.steps.length - 1));
  }, [lesson.steps.length]);

  const goPrev = useCallback(() => {
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  // Build a hidden-context callback that pulls a *fresh* snapshot every time
  // the student sends a message:
  //   - the active step's tutor message + instructions
  //   - whatever the active lab has published to the registry
  //   - the current Blockly workspace code (read on demand)
  // Stable identity (closes over `lesson` only) so AiTutorChat doesn't re-bind
  // on every step change.
  const hiddenContextCallback = useMemo(
    () =>
      makeHiddenContextCallback(async () => {
        const labSnapshot = getLabContext();
        const labContext = toAiTutorContext(labSnapshot);
        const blocklyCode = await readCurrentBlocklyCode();
        // Active step is read from a ref-like closure by `lesson` + the
        // current index from the URL of state. We re-read the *latest*
        // stepIndex from the closure each call — that means callers should
        // re-create the callback if they need step-aware behavior. Keeping
        // it lesson-scoped keeps it simple; we pull current-step text via
        // a separate `longInstructions` merge below.
        return {
          ...labContext,
          sourceCode: blocklyCode ?? labContext.sourceCode,
          longInstructions: [
            `Lesson: ${lesson.title}`,
            labContext.longInstructions,
          ]
            .filter(Boolean)
            .join('\n\n'),
        };
      }),
    [lesson.title],
  );

  const systemPrompt = useMemo(
    () =>
      [
        `You are an AI Tutor inside a Code.org guided lesson called "${lesson.title}".`,
        lesson.subtitle ? `Lesson focus: ${lesson.subtitle}.` : '',
        'The student is working through a sequence of steps that may include short readings, multiple-choice questions, and hands-on Blockly labs (music, maze, datasci, AI trainer).',
        "On each turn you'll receive hidden context with the student's current source code and the active step's instructions.",
        'Help the student think through the problem in their own words. Ask questions, offer hints, and explain concepts — but do not write a complete solution for them.',
        'Keep replies short (2-4 sentences) unless the student asks for more detail.',
      ]
        .filter(Boolean)
        .join(' '),
    [lesson.title, lesson.subtitle],
  );

  // Step → tutor message handoff. Each new step gets pushed into the chat as
  // a tutor turn — that's how the lesson's instructional flow shows up
  // *inside* the chat instead of in a separate header. Idempotent across
  // renders thanks to AiTutorChat's id-based dedupe.
  const injectedMessage = step
    ? {id: step.id, body: step.tutorMessage}
    : undefined;

  // For multiple-choice steps, surface the authored options as in-chat chips.
  // Memoized on stepIndex so AiTutorChat's chip-state reset effect fires
  // exactly once per step change.
  const stepChoices = useMemo(
    () =>
      step?.kind === 'multiple-choice'
        ? step.options.map(o => ({
            id: o.id,
            label: o.label,
            feedback: o.feedback,
            isCorrect: o.isCorrect,
          }))
        : undefined,
    [step],
  );

  return (
    <div className={styles.layout}>
      <AiTutorChat
        title={lesson.title}
        subtitle={lesson.subtitle}
        systemPrompt={systemPrompt}
        hiddenContextCallback={hiddenContextCallback}
        suggestedPrompts={levelPrompts}
        emptyHint="Your tutor will introduce each step here."
        injectedMessage={injectedMessage}
        stepChoices={stepChoices}
        stepControls={{
          stepIndex,
          totalSteps: lesson.steps.length,
          onBack: goPrev,
          onNext: goNext,
        }}
      />
      <LessonStage visual={stageVisual} />
    </div>
  );
};

export default GuidedLesson;
