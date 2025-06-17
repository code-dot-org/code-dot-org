import React, {useEffect, useState} from 'react';

import {
  StudentAnswer,
  StudentWorkEvaluation,
  evaluateStudentWork,
} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
import {fetchStudentWorkEvaluations} from '@cdo/apps/aiEvaluation/studentWorkEvaluationsApi';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import FreeResponseAiStudentResponseHeader from './FreeResponseAiStudentResponseHeader';
import FreeResponseAiSummaryBox from './FreeResponseAiSummaryBox';
import FreeResponseStudentResponseRow from './FreeResponseStudentResponseRow';

import styles from './summary.module.scss';

interface LevelData {
  levelId: number;
  unitId: number;
}

interface FreeResponseAIEvaluationProps {
  responses: StudentAnswer[];
  levelData: LevelData;
  totalNumberOfStudents: number;
}

const FreeResponseAIEvaluation: React.FunctionComponent<
  FreeResponseAIEvaluationProps
> = ({responses, levelData, totalNumberOfStudents}) => {
  const [evaluationsPending, setEvaluationsPending] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<StudentWorkEvaluation[]>([]);
  const [evaluationCount, setEvaluationCount] = useState<number>(0);
  const [showDetailedAnalysis, setShowDetailedAnalysis] =
    useState<boolean>(false);
  const evaluationComplete =
    evaluationCount > 0 && responses.length === evaluationCount;
  const [loadingExistingEvaluations, setLoadingExistingEvaluations] =
    useState<boolean>(true);

  useEffect(() => {
    if (responses.length > 0) {
      const addStudentNameAndResponseToEvaluations = (
        evaluations: StudentWorkEvaluation[]
      ): StudentWorkEvaluation[] => {
        return evaluations.map(evaluation => ({
          ...evaluation,
          studentDisplayName:
            responses.find(
              response => response.studentId === evaluation.studentId
            )?.studentDisplayName || '',
          studentWork:
            responses.find(
              response => response.studentId === evaluation.studentId
            )?.studentWork || '',
        }));
      };
      const loadExistingEvaluations = async () => {
        console.log('Loading existing evaluations...');

        const promises = responses.map(response =>
          fetchStudentWorkEvaluations(
            response.studentId,
            levelData.levelId,
            levelData.unitId
          ).catch(error => {
            console.warn(`Failed for student ${response.studentId}`, error);
            return null;
          })
        );
        const loadedEvaluations = await Promise.all(promises);

        const allExistingEvaluations = loadedEvaluations
          .filter(
            data =>
              data !== null &&
              !Array.isArray(data) &&
              data.evaluation !== 'No attempt'
          )
          .map(({evaluation, reasoning, ...rest}) => ({
            ...rest,
            aiEvaluation: evaluation,
            aiReasoning: reasoning,
          }));

        console.log('All existing evaluations:', allExistingEvaluations);
        return allExistingEvaluations;
      };

      const fetchAndSetEvaluations = async () => {
        setLoadingExistingEvaluations(true);
        const evaluations = await loadExistingEvaluations();
        const completeEvaluations =
          addStudentNameAndResponseToEvaluations(evaluations);
        setEvaluationCount(evaluations.length);
        setEvaluations(prevEvaluations => [
          ...prevEvaluations,
          ...completeEvaluations,
        ]);
        setLoadingExistingEvaluations(false);
      };

      fetchAndSetEvaluations();
    }
  }, [responses, levelData.levelId, levelData.unitId]);

  const getAIEvaluations = async () => {
    analyticsReporter.sendEvent(
      EVENTS.CFU_AI_ANALYSIS_BUTTON_CLICKED,
      {
        levelId: levelData.levelId,
        unitId: levelData.unitId,
      },
      PLATFORMS.BOTH
    );
    setEvaluationsPending(true);
    // Filter responses to only those without an existing evaluation for the studentId
    // this is snake case on the evaluations.
    const responsesWithoutUpdatedAiEvaluation = responses.filter(response => {
      const evaluation = evaluations.find(
        evaluation => evaluation.studentId === response.studentId
      );
      if (!evaluation) {
        return true;
      }
      if (
        response.updatedAt &&
        evaluation.updatedAt &&
        new Date(response.updatedAt) > new Date(evaluation.updatedAt)
      ) {
        return true;
      }
      return false;
    });

    const responsePromises = responsesWithoutUpdatedAiEvaluation.map(
      async studentResponse => {
        return evaluateStudentResponse(studentResponse);
      }
    );

    await Promise.allSettled(responsePromises);
  };

  const evaluateStudentResponse = async (studentAnswer: StudentAnswer) => {
    const aiResponse = await evaluateStudentWork(
      studentAnswer,
      levelData.levelId,
      levelData.unitId
    );
    const evaluation = {
      ...studentAnswer,
      aiEvaluation: aiResponse.aiEvaluation,
      aiReasoning: aiResponse.aiReasoning,
      evaluationCriteria: aiResponse.evaluationCriteria,
      levelId: levelData.levelId,
      unitId: levelData.unitId,
      id: aiResponse.id,
    };
    setEvaluations(prevEvaluations => [...prevEvaluations, evaluation]);
    setEvaluationCount(prevCount => prevCount + 1);
  };

  const openDetailedAnalysisHandler = () => {
    analyticsReporter.sendEvent(
      EVENTS.CFU_AI_ANALYSIS_VIEW_DETAILS,
      {
        levelId: levelData.levelId,
        unitId: levelData.unitId,
      },
      PLATFORMS.BOTH
    );
    setShowDetailedAnalysis(true);
  };

  useEffect(() => {
    if (evaluationComplete) {
      setEvaluationsPending(false);
    }
  }, [evaluationComplete]);

  return (
    <div>
      <FreeResponseAiSummaryBox
        aiEvaluationHandler={getAIEvaluations}
        disabled={
          !responses.length || evaluationsPending || loadingExistingEvaluations
        }
        isPending={evaluationsPending}
        studentWorkEvaluations={evaluations}
        evaluationComplete={evaluationComplete}
        totalNumberOfStudents={totalNumberOfStudents}
        openDetailedAnalysis={openDetailedAnalysisHandler}
      />
      {evaluationComplete && showDetailedAnalysis && (
        <div className={styles.detailedAnalysisContainer}>
          <FreeResponseAiStudentResponseHeader
            closeStudentResponses={() => setShowDetailedAnalysis(false)}
          />
          {evaluations.map(evaluation => (
            <FreeResponseStudentResponseRow
              key={evaluation.studentId}
              studentWorkEvaluation={evaluation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeResponseAIEvaluation;
