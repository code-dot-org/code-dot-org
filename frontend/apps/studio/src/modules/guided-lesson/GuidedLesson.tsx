import {useCallback, useMemo, useRef, useState} from 'react';

import {
  AiTutorChat,
  makeHiddenContextCallback,
  levelPrompts,
  type AiTutorInjectedTurn,
} from '@code-dot-org/ai-tutor';

import {
  getLabContext,
  toAiTutorContext,
} from '@/modules/ai-tutor-host/labContextRegistry';
import {readCurrentBlocklyCode} from '@/modules/ai-tutor-host/readBlocklyCode';

import {checkLabSolution} from './checkLabSolution';
import LessonStage from './LessonStage';
import type {Lesson, StageVisual} from './types';

import styles from './guidedLesson.module.scss';

interface GuidedLessonProps {
  lesson: Lesson;
}

/**
 * Orchestrates the lesson. Owns the active step plus any "off-chat"
 * interaction state — chiefly multiple-choice answers that get rendered on
 * the stage rather than as chips in the chat. When the student picks an
 * option on the stage we push two turns (their pick + the authored
 * feedback) into the chat via `injectedTurns`, and auto-advance after the
 * correct answer.
 */
const GuidedLesson = ({lesson}: GuidedLessonProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [injectedTurns, setInjectedTurns] = useState<AiTutorInjectedTurn[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track how many times each rule on each step has failed, so we can
  // escalate from `rule.hint` → `rule.hintNudge` → "ask the tutor in chat".
  // Keyed by `${stepId}:${ruleIndex}`.
  const ruleFailureCountsRef = useRef<Map<string, number>>(new Map());

  const step = lesson.steps[stepIndex];

  const advanceImmediate = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setStepIndex(i => Math.min(i + 1, lesson.steps.length - 1));
  }, [lesson.steps.length]);

  const goNext = useCallback(async () => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    // Lab steps with a `solutionCheck` get gated: ask the LLM whether the
    // student's current Blockly code matches the success description. If
    // not, append a hint turn to the chat and stay on the same step.
    if (step?.kind === 'lab' && step.solutionCheck && !isChecking) {
      setIsChecking(true);
      try {
        const result = await checkLabSolution(step.solutionCheck);
        if (!result.solved && result.rule) {
          const key = `${step.id}:${result.failedRuleIndex ?? 0}`;
          const prevCount = ruleFailureCountsRef.current.get(key) ?? 0;
          const nextCount = prevCount + 1;
          ruleFailureCountsRef.current.set(key, nextCount);
          // Tier 1: question / notice prompt. Tier 2: more concrete nudge.
          // Tier 3+: invite them to ask the tutor.
          let hintBody: string;
          if (nextCount === 1) {
            hintBody = result.rule.hint;
          } else if (nextCount === 2 && result.rule.hintNudge) {
            hintBody = result.rule.hintNudge;
          } else {
            hintBody =
              (result.rule.hintNudge ?? result.rule.hint) +
              '\n\nIf you’re still stuck, **ask me here in the chat** and I’ll walk you through it.';
          }
          setInjectedTurns(prev => [
            ...prev,
            {
              id: `${step.id}:check:${nextCount}`,
              role: 'tutor',
              body: hintBody,
            },
          ]);
          return;
        }
      } finally {
        setIsChecking(false);
      }
    }
    setStepIndex(i => Math.min(i + 1, lesson.steps.length - 1));
  }, [step, isChecking, lesson.steps.length]);

  const goPrev = useCallback(() => {
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setStepIndex(i => Math.max(i - 1, 0));
  }, []);

  // When the student picks an MC option on the stage, append their pick +
  // the authored feedback as turns in the chat. If the pick is correct,
  // schedule a delayed auto-advance so they can read the feedback first.
  const handleStageChoose = useCallback(
    (option: {id: string; label: string; isCorrect?: boolean}) => {
      if (!step || step.kind !== 'multiple-choice') return;
      const authored = step.options.find(o => o.id === option.id);
      if (!authored) return;
      const studentTurn: AiTutorInjectedTurn = {
        id: `${step.id}:${option.id}:student`,
        role: 'student',
        body: authored.label,
      };
      const tutorTurn: AiTutorInjectedTurn = {
        id: `${step.id}:${option.id}:tutor`,
        role: 'tutor',
        body: authored.feedback,
      };
      setInjectedTurns(prev => [...prev, studentTurn, tutorTurn]);
      if (authored.isCorrect) {
        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        // 1.4s — short enough to keep the lesson flowing, long enough to
        // read the green feedback bubble. The next tutor message lands in
        // the same chat thread, so context isn't lost on advance.
        advanceTimerRef.current = setTimeout(advanceImmediate, 1400);
      }
    },
    [step, advanceImmediate],
  );

  // Resolve the stage visual for the active step:
  // - MC steps with a `multiple-choice-stage-slot` marker get folded into a
  //   real `multiple-choice-stage` with question + options + click handler.
  // - The celebrate step gets its `summary` array merged into the
  //   `lesson-celebrate` visual.
  // - Everything else passes through unchanged.
  const stageVisual: StageVisual = useMemo(() => {
    if (!step) return {kind: 'none'};
    const authoredStage = step.stage;
    if (
      step.kind === 'multiple-choice' &&
      authoredStage.kind === 'multiple-choice-stage-slot'
    ) {
      return {
        kind: 'multiple-choice-stage',
        question: step.tutorMessage,
        options: step.options.map(o => ({
          id: o.id,
          label: o.label,
          isCorrect: o.isCorrect,
        })),
        onChoose: handleStageChoose,
      };
    }
    if (
      step.kind === 'celebrate' &&
      authoredStage.kind === 'lesson-celebrate'
    ) {
      return {...authoredStage, summary: step.summary};
    }
    return authoredStage;
  }, [step, handleStageChoose]);

  const hiddenContextCallback = useMemo(
    () =>
      makeHiddenContextCallback(async () => {
        const labSnapshot = getLabContext();
        const labContext = toAiTutorContext(labSnapshot);
        const blocklyCode = await readCurrentBlocklyCode();
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

  const injectedMessage = step
    ? {id: step.id, body: step.tutorMessage}
    : undefined;

  const isMcStep = step?.kind === 'multiple-choice';
  const usesStageMc =
    isMcStep && step?.stage.kind === 'multiple-choice-stage-slot';

  return (
    <div className={styles.layout}>
      <AiTutorChat
        title={lesson.title}
        subtitle={lesson.subtitle}
        systemPrompt={systemPrompt}
        hiddenContextCallback={hiddenContextCallback}
        suggestedPrompts={usesStageMc ? undefined : levelPrompts}
        emptyHint="Your tutor will introduce each step here."
        injectedMessage={injectedMessage}
        injectedTurns={injectedTurns}
        inputDisabled={usesStageMc}
        inputDisabledHint="Tap an answer on the right →"
        stepControls={{
          stepIndex,
          totalSteps: lesson.steps.length,
          onBack: goPrev,
          onNext: goNext,
          nextLabel: isChecking ? 'Checking…' : step?.kind === 'lab' && step.continueLabel
            ? step.continueLabel
            : 'Continue',
        }}
      />
      <LessonStage visual={stageVisual} />
    </div>
  );
};

export default GuidedLesson;
