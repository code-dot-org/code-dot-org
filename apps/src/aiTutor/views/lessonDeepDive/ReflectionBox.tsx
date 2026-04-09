import {Button, Typography} from '@mui/material';
import React, {FC, useCallback, useState} from 'react';

import {
  saveUserLessonObjectiveReflection,
  saveUserLessonReflection,
} from '@cdo/apps/aiTutor/reflectionsApi';

import LessonObjectiveReflection, {
  ReflectionValue,
} from './LessonObjectiveReflection';
import LessonReflection from './LessonReflection';
import {LessonDeepDiveData, ReflectionData} from './types';

import styles from './reflection.module.scss';

interface ReflectionBoxProps {
  lessonId: number;
  objectives: LessonDeepDiveData['objectives'];
  onSubmitComplete: (data: ReflectionData) => void;
}

const ReflectionBox: FC<ReflectionBoxProps> = ({
  lessonId,
  objectives,
  onSubmitComplete,
}) => {
  const [objectiveReflections, setObjectiveReflections] = useState<
    Record<string, ReflectionValue | null>
  >({});
  const [success, setSuccess] = useState('');
  const [struggle, setStruggle] = useState('');
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
      onSubmitComplete({
        objectiveReflections: objectiveReflections as Record<
          string,
          ReflectionValue
        >,
        success,
        struggle,
      });
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
  ]);

  return (
    <div>
      <Typography variant="h2" className={styles.reflectionHeading}>
        Reflection
      </Typography>
      <Typography variant="body1">
        How do you feel about each of the learning objectives for this lesson?
      </Typography>
      {objectives.map(objective => (
        <LessonObjectiveReflection
          key={objective.id}
          objective={objective}
          selected={objectiveReflections[objective.id] ?? null}
          onSelectionChange={handleSelectionChange}
        />
      ))}
      <LessonReflection
        success={success}
        struggle={struggle}
        onSuccessChange={setSuccess}
        onStruggleChange={setStruggle}
      />
      <Button
        variant="contained"
        type="button"
        fullWidth
        disabled={isSubmitting}
        onClick={handleSubmit}
        className={styles.submitButton}
      >
        Submit Reflection
      </Button>
    </div>
  );
};

export default ReflectionBox;
