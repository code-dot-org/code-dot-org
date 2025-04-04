import React, {useEffect, useState} from 'react';

import {
  AIResponse,
  StudentAnswer,
  StudentWorkEvaluation,
  evaluateStudentWork,
  summarizeEvaluations,
} from '@cdo/apps/aiEvaluation/aiEvaluationApi';

import FreeResponseAiSummaryBox from './FreeResponseAiSummaryBox';
import FreeResponseStudentResponseRow from './FreeResponseStudentResponseRow';

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
  const [aiSummary, setAiSummary] = useState<AIResponse>();
  const [showDetailedAnalysis, setShowDetailedAnalysis] =
    useState<boolean>(false);
  const evaluationComplete =
    evaluationCount > 0 && responses.length === evaluationCount;

  const getAIEvaluations = async () => {
    setEvaluationsPending(true);
    const responsePromises = responses.map(async studentResponse => {
      return evaluateStudentResponse(studentResponse);
    });

    await Promise.allSettled(responsePromises).then(() =>
      summarizeStudentEvaluations(evaluations)
    );
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
    };
    setEvaluations(prevEvaluations => [...prevEvaluations, evaluation]);
    setEvaluationCount(prevCount => prevCount + 1);
  };

  const summarizeStudentEvaluations = async (
    evaluations: StudentWorkEvaluation[]
  ) => {
    const aiSummary = await summarizeEvaluations(
      evaluations,
      levelData.levelId,
      levelData.unitId
    );
    const summary = aiSummary;
    if (summary) {
      setAiSummary(summary);
    } else {
      setAiSummary({
        aiEvaluation: 'Uh oh!',
        aiReasoning: 'Something went wrong',
        evaluationCriteria: 'unknown',
      });
    }
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
        openDetailedAnalysis={() => setShowDetailedAnalysis(true)}
      />
      {evaluationComplete && aiSummary && showDetailedAnalysis && (
        <div>
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
