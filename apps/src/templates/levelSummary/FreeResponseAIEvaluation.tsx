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

        // Likily need to clean something up here... would like to filter out arrays earlier perhaps in the controller
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

      ////// This is the line I changed here - I commented out what was working
      const fetchAndSetEvaluations = async () => {
        const evaluations = await loadExistingEvaluations();
        // what if instead we add these to evaluations state
        const completeEvaluations =
          addStudentNameAndResponseToEvaluations(evaluations);
        console.log('Fetched evaluations:', completeEvaluations);
        setEvaluationCount(evaluations.length);
        setEvaluations(prevEvaluations => [
          ...prevEvaluations,
          ...completeEvaluations,
        ]);
        // setExistingEvaluations(evaluations);
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
    const responsesWithoutAiEvaluation = responses.filter(
      response =>
        !evaluations.some(
          evaluation => evaluation.studentId === response.studentId
        )
    );

    console.log(
      'Responses without AI evaluation:',
      responsesWithoutAiEvaluation
    );

    const responsePromises = responsesWithoutAiEvaluation.map(
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
        disabled={!responses.length || evaluationsPending}
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
