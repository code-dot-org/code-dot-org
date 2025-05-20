import React, {useEffect, useState} from 'react';

import {
  StudentAnswer,
  StudentWorkEvaluation,
  evaluateStudentWork,
} from '@cdo/apps/aiEvaluation/aiEvaluationApi';
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
