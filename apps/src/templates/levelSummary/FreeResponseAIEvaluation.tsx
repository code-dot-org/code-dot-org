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

  // const loadExistingEvaluations = async () => {
  //   console.log(
  //     'Loading existing evaluations for levelId:',
  //     levelData.levelId,
  //     'unitId:',
  //     levelData.unitId
  //   );

  //   const allExistingEvaluations = [];

  //   for (const response of responses) {
  //     try {
  //       const data = await fetchStudentWorkEvaluations(
  //         response.studentId,
  //         levelData.levelId,
  //         levelData.unitId
  //       );

  //       console.log(
  //         `Fetched evaluations for student ${response.studentId}:`,
  //         data
  //       );

  //       if (data) {
  //         allExistingEvaluations.push(data); // or push(data) if you want a nested array
  //       }
  //     } catch (error) {
  //       console.warn(
  //         `Failed to fetch evaluations for student ${response.studentId}:`,
  //         error
  //       );
  //     }
  //   }

  //   console.log('All existing evaluations:', allExistingEvaluations);
  // };

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

    const results = await Promise.all(promises);

    const allExistingEvaluations = results.filter(
      data => data !== null && data.evaluation !== 'No attempt'
    );

    console.log('All existing evaluations:', allExistingEvaluations);
  };

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
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });
    loadExistingEvaluations();

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
