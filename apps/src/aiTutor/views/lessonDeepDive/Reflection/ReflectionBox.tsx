import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC, useCallback, useState} from 'react';

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

  const handleSelectionChange = useCallback(
    (objectiveId: string, value: ReflectionValue) => {
      setObjectiveReflections(prev => ({...prev, [objectiveId]: value}));
    },
    []
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

      // Always kick off podcast generation, passing the objectives the student
      // is still working on. If they rated everything "Got it" the list is
      // empty and the podcast covers the lesson generally. It runs as a
      // background job server-side and PodcastsBox retrieves it later from the
      // same lesson + objective set, so we fire and forget here — a failure must
      // not block the student from practicing.
      const strugglingObjectiveIds = objectives
        .filter(o => {
          const reflection = objectiveReflections[o.id];
          return (
            reflection === LessonObjectiveReflectionValues.LOST ||
            reflection === LessonObjectiveReflectionValues.UNSURE
          );
        })
        .map(o => o.id);
      HttpClient.post(
        '/ai_student_podcasts/generate_podcast',
        JSON.stringify({
          lesson_id: lessonId,
          objective_ids: strugglingObjectiveIds,
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

  return (
    <div className={styles.container}>
      <p className={styles.sectionLabel}>{unitLabel}</p>
      <h2 className={styles.reflectionHeading}>How did it go?</h2>
      <p className={styles.reflectionSubheading}>
        Rate each objective honestly. This shapes what we focus on first.
      </p>
      <div className={styles.objectivesList}>
        {objectives.map(objective => (
          <LessonObjectiveReflection
            key={objective.id}
            objective={objective}
            selected={objectiveReflections[objective.id] ?? null}
            onSelectionChange={handleSelectionChange}
          />
        ))}
      </div>
      <LessonReflection
        success={success}
        struggle={struggle}
        onSuccessChange={setSuccess}
        onStruggleChange={setStruggle}
      />
      <button
        type="button"
        className={styles.submitButton}
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        Start practicing
        <FontAwesomeV6Icon iconName="arrow-right" />
      </button>
    </div>
  );
};

export default ReflectionBox;
