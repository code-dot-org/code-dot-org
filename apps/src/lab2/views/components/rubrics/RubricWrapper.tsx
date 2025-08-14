import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getTaRubricFeedbackForStudent} from '@cdo/apps/templates/instructions/topInstructionsDataApi';
import {RubricData, TeacherEvaluations} from '@cdo/apps/types/rubricTypes';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

interface RubricContextType {
  showRubric: boolean;
  isLoading: boolean;
  rubricData?: RubricData;
  teacherEvaluations?: TeacherEvaluations[];
}

const RubricContext = createContext<RubricContextType | null>(null);

export function useRubric() {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubric must be used within a RubricProvider');
  }
  return context;
}

/**
 * Rubric context wrapper that loads the lesson rubric and teacher evaluations asynchronously.
 */
const RubricWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  const rubricId = useAppSelector(state => getCurrentLesson(state)?.rubric?.id);
  const showRubric =
    useAppSelector(state => state.lab.levelProperties?.showRubric) || false;

  const [rubricData, setRubricData] = useState<RubricData>();
  const [teacherEvaluations, setTeacherEvaluations] =
    useState<TeacherEvaluations[]>();
  const [isLoading, setIsLoading] = useState(false);

  const loadRubricAndEvaluations = useCallback(async () => {
    if (!rubricId) {
      return;
    }

    setRubricData(undefined);
    setTeacherEvaluations(undefined);
    setIsLoading(true);

    try {
      const rubricDataResponse = await HttpClient.fetchJson<RubricData>(
        `/rubrics/${rubricId}`
      );
      const teacherEvaluationsResponse = await getTaRubricFeedbackForStudent(
        rubricId
      );
      setRubricData(rubricDataResponse.value);
      setTeacherEvaluations(
        teacherEvaluationsResponse.value as TeacherEvaluations[]
      );
    } catch (error) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError(`Error fetching rubric data`, error as Error);
    }

    setIsLoading(false);
  }, [rubricId]);

  useEffect(() => {
    loadRubricAndEvaluations();
  }, [loadRubricAndEvaluations]);

  return (
    <RubricContext.Provider
      value={{showRubric, isLoading, rubricData, teacherEvaluations}}
    >
      {children}
    </RubricContext.Provider>
  );
};

export default RubricWrapper;
