import React, {FC, useCallback, useRef, useState} from 'react';

const ANIM_MS = 220;

import {
  saveUserLessonObjectiveReflection,
  saveUserLessonReflection,
} from '@cdo/apps/aiTutor/reflectionsApi';
import HttpClient from '@cdo/apps/util/HttpClient';
import {LessonObjectiveReflectionValues} from '@cdo/generated-scripts/sharedConstants';

import {LessonDeepDiveData, ReflectionData} from '../types';

import LessonObjectiveReflection, {
  ReflectionValue,
} from './LessonObjectiveReflection';
import LessonReflection from './LessonReflection';

import styles from './reflection.module.scss';

interface ReflectionBoxProps {
  unitLabel: string | null;
  lessonId: number;
  objectives: LessonDeepDiveData['objectives'];
  onSubmitComplete: (data: ReflectionData) => void;
  onNext: () => void;
  initialValues?: ReflectionData | null;
}

type AnimPhase =
  | 'idle'
  | 'exitingLeft'
  | 'exitingRight'
  | 'enteringFromRight'
  | 'enteringFromLeft';

const ANIM_CLASS: Record<AnimPhase, string> = {
  idle: '',
  exitingLeft: styles.exitLeft,
  exitingRight: styles.exitRight,
  enteringFromRight: styles.enterFromRight,
  enteringFromLeft: styles.enterFromLeft,
};

const ReflectionBox: FC<ReflectionBoxProps> = ({
  unitLabel,
  lessonId,
  objectives,
  onSubmitComplete,
  onNext,
  initialValues,
}) => {
  const [objectiveReflections, setObjectiveReflections] = useState<
    Record<string, ReflectionValue | null>
  >(initialValues?.objectiveReflections ?? {});
  const [success, setSuccess] = useState(initialValues?.success ?? '');
  const [struggle, setStruggle] = useState(initialValues?.struggle ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = objectives.length + 1; // objectives + free response
  const [displayStep, setDisplayStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>('idle');
  const pendingStepRef = useRef(0);

  const handleSelectionChange = useCallback(
    (objectiveId: string, value: ReflectionValue) => {
      setObjectiveReflections(prev => ({...prev, [objectiveId]: value}));
    },
    []
  );

  const navigateTo = useCallback(
    (nextStep: number) => {
      if (animPhase !== 'idle') return;
      pendingStepRef.current = nextStep;
      const goingForward = nextStep > displayStep;
      setAnimPhase(goingForward ? 'exitingLeft' : 'exitingRight');
      setTimeout(() => {
        setDisplayStep(pendingStepRef.current);
        setAnimPhase(goingForward ? 'enteringFromRight' : 'enteringFromLeft');
        setTimeout(() => setAnimPhase('idle'), ANIM_MS);
      }, ANIM_MS);
    },
    [animPhase, displayStep]
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const objectiveSaves = objectives
        .filter(
          o =>
            objectiveReflections[o.id] !== null &&
            objectiveReflections[o.id] !== undefined
        )
        .map(o =>
          saveUserLessonObjectiveReflection(
            o.id,
            objectiveReflections[o.id] as ReflectionValue
          )
        );
      await Promise.all([
        saveUserLessonReflection(lessonId, success, struggle),
        ...objectiveSaves,
      ]);

      // Always kick off podcast generation. The objective set follows the
      // student's reflection: their struggling objectives when they rated
      // anything (empty when they rated everything "Got it" — a valid
      // lesson-level podcast), or every objective when they submitted without
      // rating anything (same key the bypass-Continue path uses). It runs as a
      // background job server-side and PodcastsBox retrieves it later from the
      // same key, so fire and forget — a failure must not block the student.
      const ratedAny = objectives.some(o => !!objectiveReflections[o.id]);
      const objectiveIdsForGeneration = ratedAny
        ? objectives
            .filter(o => {
              const reflection = objectiveReflections[o.id];
              return (
                reflection === LessonObjectiveReflectionValues.LOST ||
                reflection === LessonObjectiveReflectionValues.UNSURE
              );
            })
            .map(o => o.id)
        : objectives.map(o => o.id);
      HttpClient.post(
        '/ai_student_podcasts/generate_podcast',
        JSON.stringify({
          lesson_id: lessonId,
          objective_ids: objectiveIdsForGeneration,
        }),
        true, // useAuthenticityToken
        {'Content-Type': 'application/json'}
      ).catch(() => {});

      onSubmitComplete({
        objectiveReflections: objectiveReflections as Record<
          string,
          ReflectionValue
        >,
        success,
        struggle,
      });
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  }, [
    lessonId,
    success,
    struggle,
    objectives,
    objectiveReflections,
    onSubmitComplete,
    onNext,
  ]);

  const isObjectiveStep = displayStep < objectives.length;
  const currentObjective = isObjectiveStep ? objectives[displayStep] : null;
  const currentRating = currentObjective
    ? objectiveReflections[currentObjective.id] ?? null
    : null;
  const canAdvance = !isObjectiveStep || currentRating !== null;
  const isLastStep = displayStep === totalSteps - 1;
  const isFirstStep = displayStep === 0;

  const overlineText = unitLabel
    ? `${unitLabel} Reflection`.toUpperCase()
    : 'Reflection'.toUpperCase();

  const subheadingText = isObjectiveStep
    ? 'Rate your understanding of each objective.'
    : 'Anything else you want to add?';

  return (
    <div className={styles.card}>
      <p className={styles.overline}>{overlineText}</p>
      <div className={styles.instructions}>
        <h2 className={styles.heading}>How did it go?</h2>
        <p className={styles.subheading}>{subheadingText}</p>
      </div>
      <div className={styles.content}>
        <div className={styles.pollWrapper}>
          <div className={`${styles.pollCard} ${ANIM_CLASS[animPhase]}`}>
            {isObjectiveStep && currentObjective ? (
              <LessonObjectiveReflection
                key={currentObjective.id}
                objective={currentObjective}
                selected={objectiveReflections[currentObjective.id] ?? null}
                onSelectionChange={handleSelectionChange}
              />
            ) : (
              <LessonReflection
                success={success}
                struggle={struggle}
                onSuccessChange={setSuccess}
                onStruggleChange={setStruggle}
              />
            )}
          </div>
        </div>
        <div className={styles.carouselTracker} aria-hidden="true">
          {Array.from({length: totalSteps}, (_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${
                i === displayStep ? styles.dotActive : ''
              }`}
            />
          ))}
        </div>
      </div>
      <div
        className={`${styles.footer} ${isFirstStep ? styles.footerEnd : ''}`}
      >
        {!isFirstStep && (
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigateTo(displayStep - 1)}
          >
            Back
          </button>
        )}
        {isLastStep ? (
          <button
            type="button"
            className={styles.doneButton}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            Done
          </button>
        ) : (
          <button
            type="button"
            className={styles.nextButton}
            disabled={!canAdvance}
            onClick={() => navigateTo(displayStep + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default ReflectionBox;
